/**
 * Adaptive Chunk Controller (Phase 4)
 *
 * Dynamically adjusts chunk duration based on system load to optimize
 * throughput while respecting rate limits.
 *
 * Key parameters (from implementation plan):
 * - Default chunk: 900ms
 * - Under load chunk: 1400-2000ms
 * - Max chunk: 3000ms
 * - Trigger: global tokens < 40% or local queue > 6
 *
 * The controller monitors:
 * - Token bucket fill level
 * - Queue depth
 * - Processing latency
 * - Error rate
 */
import { EventEmitter } from "events";
import { TokenBucket } from "./TokenBucket";
import { ChunkQueue } from "./ChunkQueue";
import { ChunkAggregator } from "../audio/ChunkAggregator";
/**
 * Adaptive chunk configuration.
 */
export interface AdaptiveChunkConfig {
    defaultChunkDurationMs: number;
    minChunkDurationMs: number;
    maxChunkDurationMs: number;
    tokenLowThreshold: number;
    queueHighThreshold: number;
    underLoadChunkDurationMs: number;
    highLoadChunkDurationMs: number;
    updateIntervalMs: number;
    smoothingFactor: number;
}
/**
 * Default adaptive chunk configuration per Phase 4 spec.
 */
export declare const DEFAULT_ADAPTIVE_CHUNK_CONFIG: AdaptiveChunkConfig;
/**
 * Load level classification.
 */
export declare enum LoadLevel {
    NORMAL = "normal",
    ELEVATED = "elevated",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Adaptive chunk controller state.
 */
export interface AdaptiveState {
    loadLevel: LoadLevel;
    currentTargetDurationMs: number;
    tokenPercentage: number;
    queueDepth: number;
    recommendedDurationMs: number;
}
/**
 * Adaptive Chunk Controller.
 */
export declare class AdaptiveChunkController extends EventEmitter {
    private config;
    private tokenBucket;
    private queue;
    private aggregator;
    private isRunning;
    private updateInterval;
    private currentTargetDurationMs;
    private smoothedTargetDurationMs;
    private lastLoadLevel;
    private adjustmentCount;
    private lastAdjustmentTime;
    constructor(config?: Partial<AdaptiveChunkConfig>);
    /**
     * Connects the controller to pipeline components.
     */
    connect(tokenBucket: TokenBucket, queue: ChunkQueue, aggregator: ChunkAggregator): void;
    /**
     * Starts the adaptive controller.
     */
    start(): void;
    /**
     * Stops the adaptive controller.
     */
    stop(): void;
    /**
     * Updates the chunk duration based on current system state.
     */
    private update;
    /**
     * Assesses the current system state and determines recommended duration.
     */
    private assessState;
    /**
     * Gets the current state.
     */
    getState(): AdaptiveState | null;
    /**
     * Gets the current target duration.
     */
    getCurrentTargetDuration(): number;
    /**
     * Forces a specific duration (for testing or manual override).
     */
    forceTargetDuration(durationMs: number): void;
    /**
     * Resets to default duration.
     */
    reset(): void;
    /**
     * Gets metrics.
     */
    getMetrics(): {
        currentTargetDurationMs: number;
        smoothedTargetDurationMs: number;
        loadLevel: LoadLevel;
        adjustmentCount: number;
        lastAdjustmentTime: number;
        isRunning: boolean;
    };
    /**
     * Gets the configuration.
     */
    getConfig(): AdaptiveChunkConfig;
}
//# sourceMappingURL=AdaptiveChunkController.d.ts.map