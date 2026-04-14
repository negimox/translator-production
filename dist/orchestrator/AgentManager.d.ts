/**
 * Agent Manager (Phase 7)
 *
 * Manages translator agent child processes: spawning, killing,
 * port assignment, and IPC communication for rate limit updates.
 */
import { EventEmitter } from "events";
import { TrackedAgent } from "./types";
import { OrchestratorConfig } from "./OrchestratorConfig";
import { PortAllocator } from "./PortAllocator";
export declare class AgentManager extends EventEmitter {
    private config;
    private portAllocator;
    private agents;
    private processes;
    private startupTimers;
    constructor(config: OrchestratorConfig, portAllocator: PortAllocator);
    /**
     * Spawns a new translator agent for a room/language pair.
     */
    spawnAgent(roomName: string, language: string): Promise<TrackedAgent>;
    /**
     * Kills a running agent.
     */
    killAgent(agentId: string): Promise<void>;
    /**
     * Kills all agents for a specific room.
     */
    killAllAgentsForRoom(roomName: string): Promise<void>;
    /**
     * Kills all running agents.
     */
    killAllAgents(): Promise<void>;
    /**
     * Gets a tracked agent by ID.
     */
    getAgent(agentId: string): TrackedAgent | undefined;
    /**
     * Returns true if the agent is in an active state (spawning or running).
     */
    isActiveAgent(agent: TrackedAgent): boolean;
    /**
     * Gets all agents for a room (any state).
     */
    getAgentsForRoom(roomName: string): TrackedAgent[];
    /**
     * Gets all tracked agents.
     */
    getAllAgents(): TrackedAgent[];
    /**
     * Gets the count of active (spawning/running) agents.
     */
    getTotalAgentCount(): number;
    /**
     * Broadcasts rate limit update to all running agents via IPC.
     * Each agent gets: globalCapacity / totalActiveAgents
     */
    broadcastRateLimitUpdate(): void;
    /**
     * Restarts a failed agent. Used by AgentWatchdog.
     */
    restartAgent(agentId: string): Promise<void>;
    /**
     * Builds the environment variables for a child agent process.
     */
    private buildChildEnv;
    /**
     * Handles agent process exit.
     */
    private handleAgentExit;
    /**
     * Cleans up agent state after exit.
     */
    private cleanupAgent;
    /**
     * Handles IPC messages from child agents.
     */
    private handleChildMessage;
}
//# sourceMappingURL=AgentManager.d.ts.map