"use strict";
/**
 * Webhook Server + REST API (Phase 7)
 *
 * Express server that:
 * 1. Receives webhook events from Prosody's mod_event_sync_component
 * 2. Provides REST API for manual control and monitoring
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookServer = void 0;
const express_1 = __importDefault(require("express"));
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("WebhookServer");
/* eslint-disable @typescript-eslint/no-explicit-any */
function validateRoomEvent(body) {
    return (!!body &&
        typeof body === "object" &&
        typeof body.room_name === "string");
}
function validateOccupantEvent(body) {
    return (validateRoomEvent(body) &&
        !!body.occupant &&
        typeof body.occupant.occupant_jid === "string");
}
function validateLanguageEvent(body) {
    return (validateOccupantEvent(body) &&
        typeof body.occupant.spoken_language === "string");
}
/* eslint-enable @typescript-eslint/no-explicit-any */
class WebhookServer {
    config;
    tracker;
    agentManager;
    app;
    server = null;
    startedAt = Date.now();
    constructor(config, tracker, agentManager) {
        this.config = config;
        this.tracker = tracker;
        this.agentManager = agentManager;
        this.app = (0, express_1.default)();
        this.app.use(express_1.default.json());
        this.setupAuthMiddleware();
        this.setupWebhookRoutes();
        this.setupRestApiRoutes();
    }
    /**
     * Set up authentication middleware for webhook and API mutation routes.
     * Read-only routes (/api/health, /api/status, /api/agents, /api/rooms) skip auth.
     * If a token is not configured (empty string), auth is skipped for backward compatibility.
     */
    setupAuthMiddleware() {
        const makeTokenAuth = (token) => {
            return (req, res, next) => {
                if (!token) {
                    next();
                    return;
                }
                const authHeader = req.headers.authorization;
                if (!authHeader || authHeader !== `Bearer ${token}`) {
                    res.status(401).json({ error: "Unauthorized" });
                    return;
                }
                next();
            };
        };
        // Webhook routes require webhookAuthToken
        if (this.config.webhookAuthToken) {
            this.app.use("/api/events", makeTokenAuth(this.config.webhookAuthToken));
        }
        // Mutation routes require apiAuthToken
        if (this.config.apiAuthToken) {
            const apiAuth = makeTokenAuth(this.config.apiAuthToken);
            this.app.use("/api/spawn", apiAuth);
            this.app.use("/api/kill", apiAuth);
        }
    }
    /**
     * Set up webhook routes for Prosody events.
     */
    setupWebhookRoutes() {
        this.app.post("/api/events/room/created", (req, res) => {
            try {
                if (!validateRoomEvent(req.body)) {
                    res.status(400).json({ error: "Invalid payload" });
                    return;
                }
                const event = req.body;
                logger.info("Webhook: room created", { roomName: event.room_name });
                this.tracker.onRoomCreated(event);
                res.status(200).json({ ok: true });
            }
            catch (error) {
                this.handleError(res, "room/created", error);
            }
        });
        this.app.post("/api/events/room/destroyed", (req, res) => {
            try {
                if (!validateRoomEvent(req.body)) {
                    res.status(400).json({ error: "Invalid payload" });
                    return;
                }
                const event = req.body;
                logger.info("Webhook: room destroyed", { roomName: event.room_name });
                this.tracker.onRoomDestroyed(event);
                res.status(200).json({ ok: true });
            }
            catch (error) {
                this.handleError(res, "room/destroyed", error);
            }
        });
        this.app.post("/api/events/occupant/joined", (req, res) => {
            try {
                if (!validateOccupantEvent(req.body)) {
                    res.status(400).json({ error: "Invalid payload" });
                    return;
                }
                const event = req.body;
                logger.info("Webhook: occupant joined", {
                    roomName: event.room_name,
                    occupantJid: event.occupant?.occupant_jid,
                });
                this.tracker.onOccupantJoined(event);
                res.status(200).json({ ok: true });
            }
            catch (error) {
                this.handleError(res, "occupant/joined", error);
            }
        });
        this.app.post("/api/events/occupant/left", (req, res) => {
            try {
                if (!validateOccupantEvent(req.body)) {
                    res.status(400).json({ error: "Invalid payload" });
                    return;
                }
                const event = req.body;
                logger.info("Webhook: occupant left", {
                    roomName: event.room_name,
                    occupantJid: event.occupant?.occupant_jid,
                });
                this.tracker.onOccupantLeft(event);
                res.status(200).json({ ok: true });
            }
            catch (error) {
                this.handleError(res, "occupant/left", error);
            }
        });
        this.app.post("/api/events/occupant/language-changed", (req, res) => {
            try {
                if (!validateLanguageEvent(req.body)) {
                    res.status(400).json({ error: "Invalid payload" });
                    return;
                }
                const event = req.body;
                logger.info("Webhook: language changed", {
                    roomName: event.room_name,
                    occupantJid: event.occupant?.occupant_jid,
                    language: event.occupant?.spoken_language,
                });
                this.tracker.onLanguageChanged(event);
                res.status(200).json({ ok: true });
            }
            catch (error) {
                this.handleError(res, "occupant/language-changed", error);
            }
        });
    }
    /**
     * Set up REST API routes for monitoring and manual control.
     */
    setupRestApiRoutes() {
        // System health
        this.app.get("/api/health", (_req, res) => {
            res.json({
                healthy: true,
                uptime: Date.now() - this.startedAt,
                timestamp: new Date().toISOString(),
            });
        });
        // Full system status
        this.app.get("/api/status", (_req, res) => {
            const agents = this.agentManager.getAllAgents();
            const rooms = this.tracker.toJSON();
            res.json({
                uptime: Date.now() - this.startedAt,
                totalAgents: agents.length,
                activeAgents: agents.filter((a) => a.state === "running").length,
                totalRooms: rooms.length,
                rooms,
                agents,
                timestamp: new Date().toISOString(),
            });
        });
        // List agents
        this.app.get("/api/agents", (_req, res) => {
            res.json(this.agentManager.getAllAgents());
        });
        // List rooms
        this.app.get("/api/rooms", (_req, res) => {
            res.json(this.tracker.toJSON());
        });
        // Manual spawn
        this.app.post("/api/spawn", async (req, res) => {
            try {
                const { roomName, language } = req.body;
                if (!roomName || !language) {
                    res.status(400).json({ error: "roomName and language required" });
                    return;
                }
                const agent = await this.agentManager.spawnAgent(roomName, language);
                res.json({ ok: true, agent });
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : String(error);
                res.status(500).json({ error: errMsg });
            }
        });
        // Manual kill
        this.app.post("/api/kill", async (req, res) => {
            try {
                const { agentId } = req.body;
                if (!agentId) {
                    res.status(400).json({ error: "agentId required" });
                    return;
                }
                await this.agentManager.killAgent(agentId);
                res.json({ ok: true });
            }
            catch (error) {
                const errMsg = error instanceof Error ? error.message : String(error);
                res.status(500).json({ error: errMsg });
            }
        });
    }
    /**
     * Start the HTTP server.
     */
    async start() {
        return new Promise((resolve, reject) => {
            try {
                this.server = this.app.listen(this.config.webhookPort, "0.0.0.0", () => {
                    this.startedAt = Date.now();
                    logger.info("WebhookServer started", {
                        port: this.config.webhookPort,
                        host: "0.0.0.0",
                    });
                    resolve();
                });
                this.server.on("error", (error) => {
                    logger.error("WebhookServer error", { error: String(error) });
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Stop the HTTP server.
     */
    async stop() {
        if (this.server) {
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    logger.warn("WebhookServer close timed out, forcing");
                    this.server = null;
                    resolve();
                }, 5000);
                this.server.close(() => {
                    clearTimeout(timeout);
                    logger.info("WebhookServer stopped");
                    this.server = null;
                    resolve();
                });
            });
        }
    }
    /**
     * Handle webhook processing errors.
     */
    handleError(res, route, error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.error(`Webhook handler error: ${route}`, { error: errMsg });
        res.status(500).json({ error: errMsg });
    }
}
exports.WebhookServer = WebhookServer;
//# sourceMappingURL=WebhookServer.js.map