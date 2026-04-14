/**
 * Health HTTP Server for Kubernetes probes.
 *
 * Exposes:
 * - GET /healthz - Liveness probe
 * - GET /readyz - Readiness probe
 * - GET /status - Detailed status
 */
import { AgentConfig } from "../config";
import { TranslatorAgent } from "../agent/TranslatorAgent";
/**
 * Health HTTP server class.
 */
export declare class HealthServer {
    private config;
    private agent;
    private app;
    private server;
    constructor(config: AgentConfig, agent: TranslatorAgent);
    /**
     * Sets up the health check routes.
     */
    private setupRoutes;
    /**
     * Starts the health server.
     */
    start(): Promise<void>;
    /**
     * Stops the health server.
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=HealthServer.d.ts.map