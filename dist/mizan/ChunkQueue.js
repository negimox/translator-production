"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkQueue = exports.DEFAULT_QUEUE_CONFIG = exports.ChunkPriority = void 0;
const events_1 = require("events");
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("ChunkQueue");
/**
 * Chunk priority levels.
 */
var ChunkPriority;
(function (ChunkPriority) {
    ChunkPriority[ChunkPriority["HIGH"] = 1] = "HIGH";
    ChunkPriority[ChunkPriority["NORMAL"] = 2] = "NORMAL";
    ChunkPriority[ChunkPriority["LOW"] = 3] = "LOW";
})(ChunkPriority || (exports.ChunkPriority = ChunkPriority = {}));
/**
 * Default queue configuration per Phase 4 spec.
 */
exports.DEFAULT_QUEUE_CONFIG = {
    maxQueueLength: 12,
    maxInFlight: 2,
    backpressureThreshold: 0.5, // 50% = 6 items
    maxQueueAgeMs: 10000, // 10 seconds
};
/**
 * Chunk Queue implementation.
 */
class ChunkQueue extends events_1.EventEmitter {
    config;
    queue = [];
    inFlight = 0;
    // Metrics
    totalEnqueued = 0;
    totalProcessed = 0;
    totalDropped = 0;
    totalWaitTimeMs = 0;
    // Active speaker tracking
    activeSpeakerId = null;
    constructor(config = {}) {
        super();
        this.config = { ...exports.DEFAULT_QUEUE_CONFIG, ...config };
        logger.info("ChunkQueue initialized", {
            maxQueueLength: this.config.maxQueueLength,
            maxInFlight: this.config.maxInFlight,
        });
    }
    /**
     * Sets the current active speaker ID for prioritization.
     */
    setActiveSpeaker(speakerId) {
        if (this.activeSpeakerId !== speakerId) {
            logger.debug("Active speaker changed", {
                previous: this.activeSpeakerId,
                new: speakerId,
            });
            this.activeSpeakerId = speakerId;
        }
    }
    /**
     * Enqueues a chunk for processing.
     * Returns true if enqueued, false if dropped due to backpressure.
     */
    enqueue(chunk, speakerId) {
        // Clean up stale items first
        this.pruneStale();
        // Check if queue is full
        if (this.queue.length >= this.config.maxQueueLength) {
            this.totalDropped++;
            logger.warn("Chunk dropped - queue full", {
                chunkId: chunk.chunkId,
                queueLength: this.queue.length,
                maxLength: this.config.maxQueueLength,
            });
            this.emit("chunkDropped", { chunk, reason: "queue_full" });
            return false;
        }
        // Determine priority
        const isActiveSpeaker = speakerId === this.activeSpeakerId;
        const priority = isActiveSpeaker
            ? ChunkPriority.HIGH
            : ChunkPriority.NORMAL;
        const queuedChunk = {
            chunk,
            priority,
            enqueuedAt: Date.now(),
            speakerId,
            isActiveSpeaker,
        };
        // Insert in priority order
        this.insertByPriority(queuedChunk);
        this.totalEnqueued++;
        logger.debug("Chunk enqueued", {
            chunkId: chunk.chunkId,
            priority: ChunkPriority[priority],
            queueLength: this.queue.length,
            isActiveSpeaker,
        });
        // Check backpressure
        if (this.isBackpressured()) {
            this.emit("backpressure", {
                queueLength: this.queue.length,
                threshold: this.config.backpressureThreshold * this.config.maxQueueLength,
            });
        }
        // Signal that a chunk is ready
        this.emit("chunkReady");
        return true;
    }
    /**
     * Inserts a chunk in priority order (lower priority number = higher priority).
     */
    insertByPriority(item) {
        // Find insertion point
        let insertIndex = this.queue.length;
        for (let i = 0; i < this.queue.length; i++) {
            if (item.priority < this.queue[i].priority) {
                insertIndex = i;
                break;
            }
        }
        this.queue.splice(insertIndex, 0, item);
    }
    /**
     * Dequeues the highest priority chunk for processing.
     * Returns null if queue is empty or max in-flight reached.
     */
    dequeue() {
        // Check in-flight limit
        if (this.inFlight >= this.config.maxInFlight) {
            logger.debug("Dequeue blocked - max in-flight reached", {
                inFlight: this.inFlight,
                maxInFlight: this.config.maxInFlight,
            });
            return null;
        }
        // Clean up stale items
        this.pruneStale();
        if (this.queue.length === 0) {
            return null;
        }
        const item = this.queue.shift();
        this.inFlight++;
        const waitTimeMs = Date.now() - item.enqueuedAt;
        this.totalWaitTimeMs += waitTimeMs;
        logger.debug("Chunk dequeued", {
            chunkId: item.chunk.chunkId,
            waitTimeMs,
            inFlight: this.inFlight,
            remaining: this.queue.length,
        });
        return item;
    }
    /**
     * Marks a chunk as processed (completes in-flight tracking).
     */
    markProcessed(chunkId) {
        if (this.inFlight > 0) {
            this.inFlight--;
        }
        this.totalProcessed++;
        logger.debug("Chunk marked processed", {
            chunkId,
            inFlight: this.inFlight,
        });
        // If there are more chunks and capacity, signal readiness
        if (this.queue.length > 0 && this.inFlight < this.config.maxInFlight) {
            this.emit("chunkReady");
        }
    }
    /**
     * Marks a chunk as failed (releases in-flight slot).
     */
    markFailed(chunkId, requeue = false) {
        if (this.inFlight > 0) {
            this.inFlight--;
        }
        logger.debug("Chunk marked failed", {
            chunkId,
            requeue,
            inFlight: this.inFlight,
        });
        // Optionally requeue at low priority
        if (requeue) {
            // Find the original chunk in dropped history or create placeholder
            logger.warn("Requeue not implemented - chunk dropped");
            this.totalDropped++;
        }
    }
    /**
     * Removes stale chunks that have been waiting too long.
     */
    pruneStale() {
        const now = Date.now();
        const cutoff = now - this.config.maxQueueAgeMs;
        const staleCount = this.queue.filter((item) => item.enqueuedAt < cutoff).length;
        if (staleCount > 0) {
            this.queue = this.queue.filter((item) => item.enqueuedAt >= cutoff);
            this.totalDropped += staleCount;
            logger.warn("Pruned stale chunks", {
                count: staleCount,
                remaining: this.queue.length,
            });
        }
    }
    /**
     * Checks if the queue is experiencing backpressure.
     */
    isBackpressured() {
        const threshold = this.config.backpressureThreshold * this.config.maxQueueLength;
        return this.queue.length >= threshold;
    }
    /**
     * Gets the current queue length.
     */
    getLength() {
        return this.queue.length;
    }
    /**
     * Gets the number of in-flight requests.
     */
    getInFlightCount() {
        return this.inFlight;
    }
    /**
     * Checks if there's capacity to process more chunks.
     */
    hasCapacity() {
        return this.inFlight < this.config.maxInFlight && this.queue.length > 0;
    }
    /**
     * Peeks at the next chunk without dequeuing.
     */
    peek() {
        return this.queue.length > 0 ? this.queue[0] : null;
    }
    /**
     * Gets queue statistics.
     */
    getStats() {
        return {
            queueLength: this.queue.length,
            inFlight: this.inFlight,
            totalEnqueued: this.totalEnqueued,
            totalProcessed: this.totalProcessed,
            totalDropped: this.totalDropped,
            avgWaitTimeMs: this.totalProcessed > 0
                ? this.totalWaitTimeMs / this.totalProcessed
                : 0,
            isBackpressured: this.isBackpressured(),
        };
    }
    /**
     * Clears the queue (e.g., on shutdown).
     */
    clear() {
        const cleared = this.queue.length;
        this.queue = [];
        this.totalDropped += cleared;
        logger.info("Queue cleared", { cleared });
    }
    /**
     * Resets all metrics.
     */
    resetMetrics() {
        this.totalEnqueued = 0;
        this.totalProcessed = 0;
        this.totalDropped = 0;
        this.totalWaitTimeMs = 0;
    }
    /**
     * Gets the queue configuration.
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.ChunkQueue = ChunkQueue;
//# sourceMappingURL=ChunkQueue.js.map