"use strict";
/**
 * Health HTTP Server for Kubernetes probes.
 *
 * Exposes:
 * - GET /healthz - Liveness probe
 * - GET /readyz - Readiness probe
 * - GET /status - Detailed status
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthServer = void 0;
const express_1 = __importDefault(require("express"));
const logger_1 = require("../logger");
const HealthChecks_1 = require("./HealthChecks");
const logger = (0, logger_1.createLogger)("HealthServer");
/**
 * Health HTTP server class.
 */
class HealthServer {
    config;
    agent;
    app;
    server = null;
    constructor(config, agent) {
        this.config = config;
        this.agent = agent;
        this.app = (0, express_1.default)();
        this.setupRoutes();
    }
    /**
     * Sets up the health check routes.
     */
    setupRoutes() {
        // Liveness probe - is the process alive?
        this.app.get("/healthz", async (req, res) => {
            try {
                const health = await this.agent.getHealth();
                const status = (0, HealthChecks_1.getLivenessStatus)(health);
                res.status(status.healthy ? 200 : 503).json({
                    alive: status.healthy,
                    timestamp: new Date().toISOString(),
                });
            }
            catch {
                res.status(503).json({
                    alive: false,
                    timestamp: new Date().toISOString(),
                });
            }
        });
        // Readiness probe - is the agent ready to process audio?
        this.app.get("/readyz", async (req, res) => {
            try {
                const health = await this.agent.getHealth();
                const status = (0, HealthChecks_1.getReadinessStatus)(health);
                res.status(status.ready ? 200 : 503).json({
                    ready: status.ready,
                    audioContextState: health.audioContext,
                    heartbeatsHealthy: health.heartbeatHealthy,
                    meetingConnected: health.meetingConnected,
                    timestamp: new Date().toISOString(),
                });
            }
            catch {
                res.status(503).json({
                    ready: false,
                    timestamp: new Date().toISOString(),
                });
            }
        });
        // Detailed status
        this.app.get("/status", async (req, res) => {
            try {
                const health = await this.agent.getHealth();
                // Phase 5: Get async playback health
                let playbackHealth = null;
                try {
                    playbackHealth = await this.agent.getPlaybackHealth();
                }
                catch {
                    // Ignore - browser may not be available
                }
                res.json({
                    state: health.state,
                    healthy: health.healthy,
                    uptime: health.uptime,
                    chrome: health.chrome,
                    audioContext: health.audioContext,
                    captureActive: health.captureActive,
                    outputActive: health.outputActive,
                    heartbeatHealthy: health.heartbeatHealthy,
                    meetingConnected: health.meetingConnected,
                    playback: playbackHealth,
                    targetLanguage: this.config.targetLanguage,
                    timestamp: new Date().toISOString(),
                });
            }
            catch {
                res.status(503).json({
                    error: "Failed to get health status",
                    timestamp: new Date().toISOString(),
                });
            }
        });
    }
    /**
     * Starts the health server.
     */
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.config.healthPort, () => {
                    logger.info("Health server started", {
                        port: this.config.healthPort,
                    });
                    resolve();
                });
                this.server.on("error", (error) => {
                    logger.error("Health server error", { error: String(error) });
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Stops the health server.
     */
    async stop() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    logger.info("Health server stopped");
                    this.server = null;
                    resolve();
                });
            });
        }
    }
}
exports.HealthServer = HealthServer;
//# sourceMappingURL=HealthServer.js.map