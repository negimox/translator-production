/**
 * Webhook Server + REST API (Phase 7)
 *
 * Express server that:
 * 1. Receives webhook events from Prosody's mod_event_sync_component
 * 2. Provides REST API for manual control and monitoring
 */
import { OrchestratorConfig } from "./OrchestratorConfig";
import { ConferenceTracker } from "./ConferenceTracker";
import { AgentManager } from "./AgentManager";
export declare class WebhookServer {
    private config;
    private tracker;
    private agentManager;
    private app;
    private server;
    private startedAt;
    constructor(config: OrchestratorConfig, tracker: ConferenceTracker, agentManager: AgentManager);
    /**
     * Set up authentication middleware for webhook and API mutation routes.
     * Read-only routes (/api/health, /api/status, /api/agents, /api/rooms) skip auth.
     * If a token is not configured (empty string), auth is skipped for backward compatibility.
     */
    private setupAuthMiddleware;
    /**
     * Set up webhook routes for Prosody events.
     */
    private setupWebhookRoutes;
    /**
     * Set up REST API routes for monitoring and manual control.
     */
    private setupRestApiRoutes;
    /**
     * Start the HTTP server.
     */
    start(): Promise<void>;
    /**
     * Stop the HTTP server.
     */
    stop(): Promise<void>;
    /**
     * Handle webhook processing errors.
     */
    private handleError;
}
//# sourceMappingURL=WebhookServer.d.ts.map