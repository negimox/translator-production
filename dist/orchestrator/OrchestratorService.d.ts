/**
 * Orchestrator Service (Phase 7)
 *
 * Main orchestrator class that wires together all components:
 * WebhookServer, ConferenceTracker, SpawnController, AgentManager,
 * AgentWatchdog, PortAllocator.
 */
import { OrchestratorConfig } from "./OrchestratorConfig";
export declare class OrchestratorService {
    private config;
    private portAllocator;
    private tracker;
    private agentManager;
    private spawnController;
    private watchdog;
    private webhookServer;
    constructor(config: OrchestratorConfig);
    /**
     * Start all orchestrator components.
     */
    start(): Promise<void>;
    /**
     * Stop all orchestrator components and clean up.
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=OrchestratorService.d.ts.map