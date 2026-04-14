"use strict";
/**
 * Orchestrator Entry Point (Phase 7)
 *
 * Starts the autonomous orchestrator service that manages
 * translator agents based on Prosody webhook events.
 *
 * Usage:
 *   npm run start:orchestrator
 */
Object.defineProperty(exports, "__esModule", { value: true });
const OrchestratorConfig_1 = require("./orchestrator/OrchestratorConfig");
const OrchestratorService_1 = require("./orchestrator/OrchestratorService");
const logger_1 = require("./logger");
const logger = (0, logger_1.createLogger)("OrchestratorMain");
let service = null;
let isShuttingDown = false;
/**
 * Graceful shutdown handler.
 */
async function shutdown(signal) {
    if (isShuttingDown)
        return;
    isShuttingDown = true;
    logger.info(`Received ${signal}, shutting down orchestrator`);
    const shutdownTimer = setTimeout(() => {
        logger.error("Shutdown timed out, forcing exit");
        process.exit(1);
    }, 30_000);
    try {
        if (service) {
            await service.stop();
        }
        clearTimeout(shutdownTimer);
        logger.info("Orchestrator shutdown complete");
        process.exit(0);
    }
    catch (error) {
        logger.error("Error during orchestrator shutdown", {
            error: String(error),
        });
        process.exit(1);
    }
}
// Register global error handlers
process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { reason: String(reason) });
    shutdown("UNHANDLED_REJECTION");
});
process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", {
        error: error.message,
        stack: error.stack,
    });
    shutdown("UNCAUGHT_EXCEPTION");
});
// Register signal handlers
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGHUP", () => shutdown("SIGHUP"));
/**
 * Main entry point.
 */
async function main() {
    logger.info("Starting Jitsi Translator Orchestrator");
    let config;
    try {
        config = (0, OrchestratorConfig_1.loadOrchestratorConfig)();
        logger.info("Orchestrator configuration loaded", {
            webhookPort: config.webhookPort,
            jitsiDomain: config.jitsiDomain,
            maxAgentsPerRoom: config.maxAgentsPerRoom,
            maxTotalAgents: config.maxTotalAgents,
        });
    }
    catch (error) {
        logger.error("Failed to load orchestrator configuration", {
            error: String(error),
        });
        process.exit(1);
    }
    service = new OrchestratorService_1.OrchestratorService(config);
    try {
        await service.start();
        logger.info("Orchestrator is running", {
            webhookPort: config.webhookPort,
            healthCheckInterval: config.healthCheckIntervalMs,
        });
        // Keep the process running
        await new Promise(() => {
            // This promise never resolves, keeping the process alive
            // Shutdown is handled by signal handlers
        });
    }
    catch (error) {
        logger.error("Failed to start orchestrator", { error: String(error) });
        await shutdown("ERROR");
    }
}
// Run main
main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});
//# sourceMappingURL=orchestrator-main.js.map