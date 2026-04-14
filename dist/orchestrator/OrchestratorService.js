"use strict";
/**
 * Orchestrator Service (Phase 7)
 *
 * Main orchestrator class that wires together all components:
 * WebhookServer, ConferenceTracker, SpawnController, AgentManager,
 * AgentWatchdog, PortAllocator.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const logger_1 = require("../logger");
const PortAllocator_1 = require("./PortAllocator");
const ConferenceTracker_1 = require("./ConferenceTracker");
const AgentManager_1 = require("./AgentManager");
const SpawnController_1 = require("./SpawnController");
const AgentWatchdog_1 = require("./AgentWatchdog");
const WebhookServer_1 = require("./WebhookServer");
const logger = (0, logger_1.createLogger)("OrchestratorService");
class OrchestratorService {
    config;
    portAllocator;
    tracker;
    agentManager;
    spawnController;
    watchdog;
    webhookServer;
    constructor(config) {
        this.config = config;
        // Create components in dependency order
        this.portAllocator = new PortAllocator_1.PortAllocator(config.botPagePortBase, config.healthPortBase);
        this.tracker = new ConferenceTracker_1.ConferenceTracker();
        this.agentManager = new AgentManager_1.AgentManager(config, this.portAllocator);
        this.spawnController = new SpawnController_1.SpawnController(config, this.tracker, this.agentManager);
        this.watchdog = new AgentWatchdog_1.AgentWatchdog(config, this.agentManager);
        this.webhookServer = new WebhookServer_1.WebhookServer(config, this.tracker, this.agentManager);
        logger.info("OrchestratorService created");
    }
    /**
     * Start all orchestrator components.
     */
    async start() {
        logger.info("Starting OrchestratorService");
        // Start the webhook server (receives Prosody events)
        await this.webhookServer.start();
        // Start the spawn controller (listens to tracker events)
        this.spawnController.start();
        // Start the watchdog (health monitoring)
        this.watchdog.start();
        logger.info("OrchestratorService started", {
            webhookPort: this.config.webhookPort,
            maxAgentsPerRoom: this.config.maxAgentsPerRoom,
            maxTotalAgents: this.config.maxTotalAgents,
        });
    }
    /**
     * Stop all orchestrator components and clean up.
     */
    async stop() {
        logger.info("Stopping OrchestratorService");
        // Stop watchdog first (no more health checks)
        this.watchdog.stop();
        // Stop spawn controller (no more spawn/kill decisions)
        this.spawnController.stop();
        // Kill all running agents
        await this.agentManager.killAllAgents();
        // Stop webhook server last
        await this.webhookServer.stop();
        logger.info("OrchestratorService stopped");
    }
}
exports.OrchestratorService = OrchestratorService;
//# sourceMappingURL=OrchestratorService.js.map