"use strict";
/**
 * Agent Watchdog (Phase 7)
 *
 * Periodically polls each running agent's /healthz endpoint.
 * Restarts agents that fail consecutive health checks.
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
exports.AgentWatchdog = void 0;
const http = __importStar(require("http"));
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("AgentWatchdog");
class AgentWatchdog {
    config;
    agentManager;
    checkInterval = null;
    constructor(config, agentManager) {
        this.config = config;
        this.agentManager = agentManager;
        logger.info("AgentWatchdog initialized");
    }
    /**
     * Start periodic health checking.
     */
    start() {
        if (this.checkInterval)
            return;
        this.checkInterval = setInterval(() => {
            this.checkAllAgents();
        }, this.config.healthCheckIntervalMs);
        logger.info("AgentWatchdog started", {
            intervalMs: this.config.healthCheckIntervalMs,
        });
    }
    /**
     * Stop health checking.
     */
    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        logger.info("AgentWatchdog stopped");
    }
    /**
     * Check health of all running agents.
     */
    async checkAllAgents() {
        const agents = this.agentManager
            .getAllAgents()
            .filter((a) => a.state === "running");
        for (const agent of agents) {
            await this.checkAgent(agent);
        }
    }
    /**
     * Check health of a single agent.
     */
    async checkAgent(agent) {
        try {
            const healthy = await this.httpHealthCheck(agent.healthPort);
            agent.lastHealthCheck = Date.now();
            if (healthy) {
                // Reset failure counter on success
                if (agent.consecutiveHealthFailures > 0) {
                    logger.debug("Agent health restored", { agentId: agent.id });
                }
                agent.consecutiveHealthFailures = 0;
            }
            else {
                agent.consecutiveHealthFailures++;
                logger.warn("Agent health check failed", {
                    agentId: agent.id,
                    consecutiveFailures: agent.consecutiveHealthFailures,
                });
                await this.handleFailure(agent);
            }
        }
        catch (error) {
            agent.consecutiveHealthFailures++;
            agent.lastHealthCheck = Date.now();
            const errMsg = error instanceof Error ? error.message : String(error);
            logger.warn("Agent health check error", {
                agentId: agent.id,
                error: errMsg,
                consecutiveFailures: agent.consecutiveHealthFailures,
            });
            await this.handleFailure(agent);
        }
    }
    /**
     * Handle a health check failure.
     */
    async handleFailure(agent) {
        if (agent.consecutiveHealthFailures < this.config.healthCheckMaxFailures) {
            return; // Not enough failures yet
        }
        // Check restart limits
        if (this.isRestartLimitExceeded(agent)) {
            logger.error("Agent restart limit exceeded, marking as failed", {
                agentId: agent.id,
                restartCount: agent.restartCount,
                maxRestarts: this.config.maxRestartsPerWindow,
            });
            agent.state = "failed";
            return;
        }
        // Restart the agent
        logger.info("Restarting unhealthy agent", {
            agentId: agent.id,
            consecutiveFailures: agent.consecutiveHealthFailures,
        });
        try {
            await this.agentManager.restartAgent(agent.id);
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            logger.error("Failed to restart agent", {
                agentId: agent.id,
                error: errMsg,
            });
        }
    }
    /**
     * Check if agent has exceeded restart limits within the window.
     */
    isRestartLimitExceeded(agent) {
        const windowStart = Date.now() - this.config.restartWindowMs;
        // Simple check: if spawnedAt is within the window and restartCount >= max
        if (agent.spawnedAt > windowStart &&
            agent.restartCount >= this.config.maxRestartsPerWindow) {
            return true;
        }
        return false;
    }
    /**
     * Perform an HTTP health check on an agent's /healthz endpoint.
     */
    httpHealthCheck(port) {
        return new Promise((resolve) => {
            const req = http.get(`http://127.0.0.1:${port}/healthz`, { timeout: 5000 }, (res) => {
                resolve(res.statusCode === 200);
                res.resume(); // Consume response data to free memory
            });
            req.on("error", () => resolve(false));
            req.on("timeout", () => {
                req.destroy();
                resolve(false);
            });
        });
    }
}
exports.AgentWatchdog = AgentWatchdog;
//# sourceMappingURL=AgentWatchdog.js.map