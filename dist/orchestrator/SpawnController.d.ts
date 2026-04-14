/**
 * Spawn Controller (Phase 7)
 *
 * Decision engine for spawning/terminating translator agents based on
 * conference state (participants, languages). Listens to ConferenceTracker
 * events and delegates to AgentManager.
 */
import { OrchestratorConfig } from "./OrchestratorConfig";
import { ConferenceTracker } from "./ConferenceTracker";
import { AgentManager } from "./AgentManager";
export declare class SpawnController {
    private config;
    private tracker;
    private agentManager;
    private spawnCooldowns;
    private terminationTimers;
    private roomLocks;
    private boundOnSpawnEval;
    private boundOnTermEval;
    private boundOnRoomDestroyed;
    constructor(config: OrchestratorConfig, tracker: ConferenceTracker, agentManager: AgentManager);
    /**
     * Start listening to tracker events.
     */
    start(): void;
    /**
     * Stop listening and clear all timers.
     */
    stop(): void;
    /**
     * Serializes async operations per room to prevent race conditions.
     */
    private withRoomLock;
    /**
     * Evaluate whether to spawn agents for a room.
     * Called on language-changed and occupant-joined events.
     */
    private evaluateSpawn;
    /**
     * Evaluate whether to terminate agents for a room.
     * Called on occupant-left events and when spawn conditions are not met.
     */
    private evaluateTermination;
    /**
     * Handle room destruction — immediate kill all agents (no grace period).
     */
    private onRoomDestroyed;
    /**
     * Schedule agent termination after grace period.
     */
    private scheduleTermination;
    /**
     * Returns true if conditions require no agents in the room
     * (fewer than 2 real participants or fewer than 2 languages).
     * If agentLanguage is provided, also checks whether that specific
     * language is still spoken by any participant.
     */
    private shouldHaveNoAgents;
    /**
     * Cancel a pending termination.
     */
    private cancelTermination;
}
//# sourceMappingURL=SpawnController.d.ts.map