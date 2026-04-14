/**
 * Main Translator Agent class.
 * Orchestrates the headless Chrome browser, meeting connection, and audio infrastructure.
 *
 * Phase 3 additions:
 * - AudioBridge for chunk aggregation
 * - VAD-driven audio capture
 * - Debug chunk file saving
 *
 * Phase 4 additions:
 * - TranslationPipeline integration
 * - Mizan API orchestration
 * - Rate limiting and circuit breaker
 * - Adaptive chunking
 */
import { AgentConfig } from "../config";
import { AudioChunk } from "../audio/AudioBridge";
import { AgentHealthState } from "../health/HealthChecks";
import { TranslationPipeline } from "../mizan";
/**
 * Agent lifecycle states.
 */
export declare enum AgentState {
    IDLE = "idle",
    STARTING = "starting",
    CONNECTING = "connecting",
    JOINED = "joined",
    CAPTURING = "capturing",// Phase 3: Added state for audio capture
    TRANSLATING = "translating",// Phase 4: Translation pipeline active
    ERROR = "error",
    STOPPING = "stopping",
    STOPPED = "stopped"
}
/**
 * Main Translator Agent class.
 * Manages the lifecycle of a translator agent that joins a Jitsi meeting.
 */
export declare class TranslatorAgent {
    private config;
    private chrome;
    private audioManager;
    private heartbeatMonitor;
    private audioBridge;
    private jitsiConnection;
    private botPageServer;
    private state;
    private startTime;
    private translationPipeline;
    private adaptiveChunkController;
    private onChunkCallback;
    private onAudioOutputCallback;
    constructor(config: AgentConfig);
    /**
     * Gets the current agent state.
     */
    getState(): AgentState;
    /**
     * Sets a callback for when audio chunks are ready.
     * This is used by the orchestration layer (Phase 4+) to process chunks.
     */
    setOnChunkCallback(callback: (chunk: AudioChunk) => void): void;
    /**
     * Starts the translator agent.
     * Launches Chrome, connects to the meeting, and initializes audio infrastructure.
     */
    start(): Promise<void>;
    /**
     * Phase 3: Initializes the audio bridge for chunk aggregation.
     */
    private initializeAudioBridge;
    /**
     * Phase 3: Handles a completed audio chunk.
     */
    private handleChunk;
    /**
     * Phase 4/7.1: Initializes the translation pipeline.
     * In Phase 7.1, supports both ElevenLabs+Mizan and legacy Mizan-only modes.
     */
    private initializeTranslationPipeline;
    /**
     * Sets a callback for when translated audio is ready (Phase 4+).
     */
    setOnAudioOutputCallback(callback: (audio: ArrayBuffer, chunkId: string) => void): void;
    /**
     * Handles heartbeat timeout by reinitializing the audio worklet.
     */
    private handleHeartbeatTimeout;
    /**
     * Stops the translator agent and cleans up resources.
     */
    stop(): Promise<void>;
    /**
     * Cleans up all resources.
     */
    private cleanup;
    /**
     * Gets the current health status of the agent.
     */
    getHealth(): Promise<AgentHealthState>;
    /**
     * Phase 3: Gets the audio bridge metrics.
     */
    getAudioMetrics(): {
        framesReceived: number;
        chunksEmitted: number;
        isCapturing: boolean;
    } | null;
    /**
     * Phase 4: Gets the translation pipeline metrics.
     */
    getPipelineMetrics(): import("../mizan").PipelineMetrics | null;
    /**
     * Phase 4: Gets the translation pipeline.
     */
    getTranslationPipeline(): TranslationPipeline | null;
    /**
     * Phase 7: Updates the rate limit for the translation pipeline's token bucket.
     * Called when the orchestrator adjusts fractional rate limits via IPC.
     */
    updateRateLimit(capacity: number, refillRate: number): void;
    /**
     * Phase 3: Gets the chunk aggregator for direct access.
     */
    getAggregator(): import("../audio").ChunkAggregator | null;
    /**
     * Phase 5: Gets async playback health from the browser.
     */
    getPlaybackHealth(): Promise<{
        trackPublished: boolean;
        trackMuted: boolean;
        destinationActive: boolean;
        queueLength: number;
        isPlaying: boolean;
    } | null>;
}
//# sourceMappingURL=TranslatorAgent.d.ts.map