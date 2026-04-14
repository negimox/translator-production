"use strict";
/**
 * Agent Manager (Phase 7)
 *
 * Manages translator agent child processes: spawning, killing,
 * port assignment, and IPC communication for rate limit updates.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const logger_1 = require("../logger");
const TranslationPipeline_1 = require("../mizan/TranslationPipeline");
const logger = (0, logger_1.createLogger)("AgentManager");
class AgentManager extends events_1.EventEmitter {
    config;
    portAllocator;
    agents = new Map();
    processes = new Map();
    startupTimers = new Map();
    constructor(config, portAllocator) {
        super();
        this.config = config;
        this.portAllocator = portAllocator;
        logger.info("AgentManager initialized");
    }
    /**
     * Spawns a new translator agent for a room/language pair.
     */
    async spawnAgent(roomName, language) {
        const agentId = `${roomName}:${language}`;
        // Check if already running
        const existing = this.agents.get(agentId);
        if (existing && this.isActiveAgent(existing)) {
            logger.warn("Agent already running", { agentId });
            return existing;
        }
        // Check limits
        if (this.getTotalAgentCount() >= this.config.maxTotalAgents) {
            throw new Error(`Total agent limit reached: ${this.config.maxTotalAgents}`);
        }
        const roomAgents = this.getAgentsForRoom(roomName);
        if (roomAgents.length >= this.config.maxAgentsPerRoom) {
            throw new Error(`Per-room agent limit reached: ${this.config.maxAgentsPerRoom}`);
        }
        // Allocate ports
        const { botPagePort, healthPort } = this.portAllocator.allocate();
        // Create tracked agent
        const agent = {
            id: agentId,
            roomName,
            language,
            state: "spawning",
            pid: null,
            botPagePort,
            healthPort,
            spawnedAt: Date.now(),
            restartCount: existing?.restartCount || 0,
            lastHealthCheck: null,
            consecutiveHealthFailures: 0,
        };
        this.agents.set(agentId, agent);
        // Build environment for child process
        const childEnv = this.buildChildEnv(roomName, language, botPagePort, healthPort);
        // Fork the child process
        const agentEntryPoint = path.resolve(__dirname, "../../dist/index.js");
        logger.info("Spawning agent", {
            agentId,
            entryPoint: agentEntryPoint,
            botPagePort,
            healthPort,
        });
        try {
            const child = (0, child_process_1.fork)(agentEntryPoint, [], {
                env: childEnv,
                stdio: ["pipe", "pipe", "pipe", "ipc"],
                silent: true,
            });
            agent.pid = child.pid || null;
            this.processes.set(agentId, child);
            // Pipe child stdout/stderr with agent prefix
            if (child.stdout) {
                child.stdout.on("data", (data) => {
                    const lines = data.toString().trim().split("\n");
                    for (const line of lines) {
                        logger.debug(`[${agentId}] ${line}`);
                    }
                });
            }
            if (child.stderr) {
                child.stderr.on("data", (data) => {
                    const lines = data.toString().trim().split("\n");
                    for (const line of lines) {
                        logger.warn(`[${agentId}:stderr] ${line}`);
                    }
                });
            }
            // Handle child exit
            child.on("exit", (code, signal) => {
                logger.info("Agent process exited", { agentId, code, signal });
                this.handleAgentExit(agentId, code, signal);
            });
            child.on("error", (err) => {
                logger.error("Agent process error", { agentId, error: err.message });
                this.handleAgentExit(agentId, 1, null);
            });
            // Handle IPC messages from child
            child.on("message", (msg) => {
                this.handleChildMessage(agentId, msg);
            });
            // Set startup timeout — agent must send "agent-ready" within this period
            const startupTimer = setTimeout(() => {
                this.startupTimers.delete(agentId);
                const currentAgent = this.agents.get(agentId);
                if (currentAgent && currentAgent.state === "spawning") {
                    logger.error("Agent startup timeout", { agentId });
                    this.killAgent(agentId).catch((err) => logger.error("Failed to kill timed-out agent", {
                        agentId,
                        error: String(err),
                    }));
                }
            }, this.config.agentStartupTimeoutMs);
            this.startupTimers.set(agentId, startupTimer);
            // Broadcast updated rate limits to all agents
            this.broadcastRateLimitUpdate();
            logger.info("Agent spawned", { agentId, pid: agent.pid });
            this.emit("agent-spawned", { agentId, roomName, language });
            return agent;
        }
        catch (error) {
            // Spawn failed — clean up
            agent.state = "failed";
            this.portAllocator.release(botPagePort, healthPort);
            const errMsg = error instanceof Error ? error.message : String(error);
            logger.error("Failed to spawn agent", { agentId, error: errMsg });
            throw error;
        }
    }
    /**
     * Kills a running agent.
     */
    async killAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            logger.warn("Agent not found for kill", { agentId });
            return;
        }
        if (agent.state === "stopping" || agent.state === "stopped") {
            return;
        }
        agent.state = "stopping";
        const child = this.processes.get(agentId);
        if (child && child.connected) {
            logger.info("Sending SIGTERM to agent", { agentId, pid: agent.pid });
            child.kill("SIGTERM");
            // Force kill after 10 seconds
            const forceKillTimer = setTimeout(() => {
                if (agent.state === "stopping") {
                    logger.warn("Force killing agent", { agentId });
                    try {
                        child.kill("SIGKILL");
                    }
                    catch {
                        /* already dead */
                    }
                }
            }, 10000);
            // Wait for exit
            await new Promise((resolve) => {
                const onExit = () => {
                    clearTimeout(forceKillTimer);
                    resolve();
                };
                child.once("exit", onExit);
                // Also resolve if already dead
                if (!child.connected) {
                    clearTimeout(forceKillTimer);
                    resolve();
                }
            });
        }
        else {
            // No process or already disconnected
            this.cleanupAgent(agentId);
        }
    }
    /**
     * Kills all agents for a specific room.
     */
    async killAllAgentsForRoom(roomName) {
        const agents = this.getAgentsForRoom(roomName);
        await Promise.all(agents.map((a) => this.killAgent(a.id)));
    }
    /**
     * Kills all running agents.
     */
    async killAllAgents() {
        const allAgents = Array.from(this.agents.values());
        await Promise.all(allAgents.map((a) => this.killAgent(a.id)));
    }
    /**
     * Gets a tracked agent by ID.
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    /**
     * Returns true if the agent is in an active state (spawning or running).
     */
    isActiveAgent(agent) {
        return agent.state === "spawning" || agent.state === "running";
    }
    /**
     * Gets all agents for a room (any state).
     */
    getAgentsForRoom(roomName) {
        return Array.from(this.agents.values()).filter((a) => a.roomName === roomName && this.isActiveAgent(a));
    }
    /**
     * Gets all tracked agents.
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Gets the count of active (spawning/running) agents.
     */
    getTotalAgentCount() {
        return Array.from(this.agents.values()).filter((a) => this.isActiveAgent(a))
            .length;
    }
    /**
     * Broadcasts rate limit update to all running agents via IPC.
     * Each agent gets: globalCapacity / totalActiveAgents
     */
    broadcastRateLimitUpdate() {
        const activeCount = this.getTotalAgentCount();
        if (activeCount === 0)
            return;
        const perAgentCapacity = this.config.globalTokenBucketCapacity / activeCount;
        const perAgentRefillRate = this.config.globalTokenBucketRefillRate / activeCount;
        const msg = {
            type: "rate-limit-update",
            capacity: perAgentCapacity,
            refillRate: perAgentRefillRate,
        };
        logger.info("Broadcasting rate limit update", {
            activeCount,
            perAgentCapacity: perAgentCapacity.toFixed(2),
            perAgentRefillRate: perAgentRefillRate.toFixed(2),
        });
        for (const [agentId, child] of this.processes.entries()) {
            const agent = this.agents.get(agentId);
            if (agent && agent.state === "running" && child.connected) {
                try {
                    child.send(msg);
                }
                catch (error) {
                    logger.warn("Failed to send IPC to agent", { agentId });
                }
            }
        }
    }
    /**
     * Restarts a failed agent. Used by AgentWatchdog.
     */
    async restartAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        const { roomName, language, restartCount } = agent;
        logger.info("Restarting agent", {
            agentId,
            restartCount,
        });
        await this.killAgent(agentId);
        // spawnAgent picks up restartCount from existing entry, but killAgent
        // now deletes the entry. Pass the incremented count via a temporary entry.
        const newAgent = await this.spawnAgent(roomName, language);
        newAgent.restartCount = restartCount + 1;
    }
    /**
     * Builds the environment variables for a child agent process.
     */
    buildChildEnv(roomName, language, botPagePort, healthPort) {
        // Determine source language: the agent translates FROM all other languages TO this language.
        // So if the agent is for 'hi', it translates English → Hindi.
        // The sourceLanguage in the original config is a default; for orchestrator agents
        // the target language IS the agent's language.
        return {
            ...process.env,
            JITSI_DOMAIN: this.config.jitsiDomain,
            ROOM_NAME: roomName,
            TARGET_LANGUAGE: language,
            SOURCE_LANGUAGE: this.config.sourceLanguage,
            BOT_PAGE_PORT: String(botPagePort),
            HEALTH_PORT: String(healthPort),
            MIZAN_BASE_URL: this.config.mizanBaseUrl,
            MIZAN_USERNAME: this.config.mizanUsername,
            MIZAN_PASSWORD: this.config.mizanPassword,
            AGENT_DISPLAY_NAME_PREFIX: this.config.agentDisplayNamePrefix,
            TTS_VOICE: TranslationPipeline_1.TranslationPipeline.getVoiceForLanguage(language),
            TTS_SPEED: String(this.config.ttsSpeed),
            TRANSLATION_TEMPLATE_PATTERN: this.config.translationTemplatePattern,
            LOG_LEVEL: this.config.logLevel,
            // Disable debug mode for orchestrated agents
            DEBUG_MODE: "false",
        };
    }
    /**
     * Handles agent process exit.
     */
    handleAgentExit(agentId, code, signal) {
        this.cleanupAgent(agentId);
        this.emit("agent-exited", { agentId, code, signal });
        // Broadcast updated rate limits after an agent exits
        this.broadcastRateLimitUpdate();
    }
    /**
     * Cleans up agent state after exit.
     */
    cleanupAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            this.portAllocator.release(agent.botPagePort, agent.healthPort);
        }
        const startupTimer = this.startupTimers.get(agentId);
        if (startupTimer) {
            clearTimeout(startupTimer);
            this.startupTimers.delete(agentId);
        }
        this.processes.delete(agentId);
        this.agents.delete(agentId);
    }
    /**
     * Handles IPC messages from child agents.
     */
    handleChildMessage(agentId, msg) {
        if (!msg || typeof msg !== "object")
            return;
        const message = msg;
        if (message.type === "agent-ready") {
            const agent = this.agents.get(agentId);
            if (agent && agent.state === "spawning") {
                agent.state = "running";
                logger.info("Agent ready", { agentId });
                // Clear startup timeout
                const timer = this.startupTimers.get(agentId);
                if (timer) {
                    clearTimeout(timer);
                    this.startupTimers.delete(agentId);
                }
                // Now safe to include in rate distribution
                this.broadcastRateLimitUpdate();
            }
        }
        else if (message.type === "metrics") {
            this.emit("agent-metrics", { agentId, metrics: message.pipelineMetrics });
        }
    }
}
exports.AgentManager = AgentManager;
//# sourceMappingURL=AgentManager.js.map