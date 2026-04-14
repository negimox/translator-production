/**
 * Agent Watchdog (Phase 7)
 *
 * Periodically polls each running agent's /healthz endpoint.
 * Restarts agents that fail consecutive health checks.
 */
import { OrchestratorConfig } from "./OrchestratorConfig";
import { AgentManager } from "./AgentManager";
export declare class AgentWatchdog {
    private config;
    private agentManager;
    private checkInterval;
    constructor(config: OrchestratorConfig, agentManager: AgentManager);
    /**
     * Start periodic health checking.
     */
    start(): void;
    /**
     * Stop health checking.
     */
    stop(): void;
    /**
     * Check health of all running agents.
     */
    private checkAllAgents;
    /**
     * Check health of a single agent.
     */
    private checkAgent;
    /**
     * Handle a health check failure.
     */
    private handleFailure;
    /**
     * Check if agent has exceeded restart limits within the window.
     */
    private isRestartLimitExceeded;
    /**
     * Perform an HTTP health check on an agent's /healthz endpoint.
     */
    private httpHealthCheck;
}
//# sourceMappingURL=AgentWatchdog.d.ts.map