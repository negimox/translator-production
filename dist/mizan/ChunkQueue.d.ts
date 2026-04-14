/**
 * Chunk Queue with Priority Support (Phase 4)
 *
 * Manages a queue of audio chunks waiting for translation processing.
 *
 * Key parameters (from implementation plan):
 * - Max in-flight Mizan requests per agent: 2
 * - Max local queue length per agent: 12
 *
 * Features:
 * - Priority-based processing (active-speaker chunks first)
 * - Backpressure signaling
 * - Queue metrics and monitoring
 */
import { EventEmitter } from "events";
import { AudioChunk } from "../audio/ChunkAggregator";
/**
 * Queue item wrapping an audio chunk with metadata.
 */
export interface QueuedChunk {
    chunk: AudioChunk;
    priority: ChunkPriority;
    enqueuedAt: number;
    speakerId?: string;
    isActiveSpeaker: boolean;
}
/**
 * Chunk priority levels.
 */
export declare enum ChunkPriority {
    HIGH = 1,// Active speaker
    NORMAL = 2,// Regular participants
    LOW = 3
}
/**
 * Queue configuration.
 */
export interface ChunkQueueConfig {
    maxQueueLength: number;
    maxInFlight: number;
    backpressureThreshold: number;
    maxQueueAgeMs: number;
}
/**
 * Default queue configuration per Phase 4 spec.
 */
export declare const DEFAULT_QUEUE_CONFIG: ChunkQueueConfig;
/**
 * Queue statistics.
 */
export interface QueueStats {
    queueLength: number;
    inFlight: number;
    totalEnqueued: number;
    totalProcessed: number;
    totalDropped: number;
    avgWaitTimeMs: number;
    isBackpressured: boolean;
}
/**
 * Chunk Queue implementation.
 */
export declare class ChunkQueue extends EventEmitter {
    private config;
    private queue;
    private inFlight;
    private totalEnqueued;
    private totalProcessed;
    private totalDropped;
    private totalWaitTimeMs;
    private activeSpeakerId;
    constructor(config?: Partial<ChunkQueueConfig>);
    /**
     * Sets the current active speaker ID for prioritization.
     */
    setActiveSpeaker(speakerId: string | null): void;
    /**
     * Enqueues a chunk for processing.
     * Returns true if enqueued, false if dropped due to backpressure.
     */
    enqueue(chunk: AudioChunk, speakerId?: string): boolean;
    /**
     * Inserts a chunk in priority order (lower priority number = higher priority).
     */
    private insertByPriority;
    /**
     * Dequeues the highest priority chunk for processing.
     * Returns null if queue is empty or max in-flight reached.
     */
    dequeue(): QueuedChunk | null;
    /**
     * Marks a chunk as processed (completes in-flight tracking).
     */
    markProcessed(chunkId: string): void;
    /**
     * Marks a chunk as failed (releases in-flight slot).
     */
    markFailed(chunkId: string, requeue?: boolean): void;
    /**
     * Removes stale chunks that have been waiting too long.
     */
    private pruneStale;
    /**
     * Checks if the queue is experiencing backpressure.
     */
    isBackpressured(): boolean;
    /**
     * Gets the current queue length.
     */
    getLength(): number;
    /**
     * Gets the number of in-flight requests.
     */
    getInFlightCount(): number;
    /**
     * Checks if there's capacity to process more chunks.
     */
    hasCapacity(): boolean;
    /**
     * Peeks at the next chunk without dequeuing.
     */
    peek(): QueuedChunk | null;
    /**
     * Gets queue statistics.
     */
    getStats(): QueueStats;
    /**
     * Clears the queue (e.g., on shutdown).
     */
    clear(): void;
    /**
     * Resets all metrics.
     */
    resetMetrics(): void;
    /**
     * Gets the queue configuration.
     */
    getConfig(): ChunkQueueConfig;
}
//# sourceMappingURL=ChunkQueue.d.ts.map