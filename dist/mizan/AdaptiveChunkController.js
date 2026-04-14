"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveChunkController = exports.LoadLevel = exports.DEFAULT_ADAPTIVE_CHUNK_CONFIG = void 0;
const events_1 = require("events");
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("AdaptiveChunkController");
/**
 * Default adaptive chunk configuration per Phase 4 spec.
 */
exports.DEFAULT_ADAPTIVE_CHUNK_CONFIG = {
    defaultChunkDurationMs: 900,
    minChunkDurationMs: 500,
    maxChunkDurationMs: 3000,
    tokenLowThreshold: 0.4, // 40%
    queueHighThreshold: 6,
    underLoadChunkDurationMs: 1400,
    highLoadChunkDurationMs: 2000,
    updateIntervalMs: 1000,
    smoothingFactor: 0.3,
};
/**
 * Load level classification.
 */
var LoadLevel;
(function (LoadLevel) {
    LoadLevel["NORMAL"] = "normal";
    LoadLevel["ELEVATED"] = "elevated";
    LoadLevel["HIGH"] = "high";
    LoadLevel["CRITICAL"] = "critical";
})(LoadLevel || (exports.LoadLevel = LoadLevel = {}));
/**
 * Adaptive Chunk Controller.
 */
class AdaptiveChunkController extends events_1.EventEmitter {
    config;
    tokenBucket = null;
    queue = null;
    aggregator = null;
    isRunning = false;
    updateInterval = null;
    currentTargetDurationMs;
    smoothedTargetDurationMs;
    lastLoadLevel = LoadLevel.NORMAL;
    // Metrics
    adjustmentCount = 0;
    lastAdjustmentTime = 0;
    constructor(config = {}) {
        super();
        this.config = { ...exports.DEFAULT_ADAPTIVE_CHUNK_CONFIG, ...config };
        this.currentTargetDurationMs = this.config.defaultChunkDurationMs;
        this.smoothedTargetDurationMs = this.config.defaultChunkDurationMs;
        logger.info("AdaptiveChunkController initialized", {
            defaultDuration: this.config.defaultChunkDurationMs,
            minDuration: this.config.minChunkDurationMs,
            maxDuration: this.config.maxChunkDurationMs,
        });
    }
    /**
     * Connects the controller to pipeline components.
     */
    connect(tokenBucket, queue, aggregator) {
        this.tokenBucket = tokenBucket;
        this.queue = queue;
        this.aggregator = aggregator;
        logger.info("AdaptiveChunkController connected to components");
    }
    /**
     * Starts the adaptive controller.
     */
    start() {
        if (this.isRunning) {
            logger.warn("AdaptiveChunkController already running");
            return;
        }
        if (!this.tokenBucket || !this.queue || !this.aggregator) {
            throw new Error("AdaptiveChunkController not connected - call connect() first");
        }
        this.isRunning = true;
        // Start update loop
        this.updateInterval = setInterval(() => {
            this.update();
        }, this.config.updateIntervalMs);
        logger.info("AdaptiveChunkController started");
    }
    /**
     * Stops the adaptive controller.
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        logger.info("AdaptiveChunkController stopped", {
            totalAdjustments: this.adjustmentCount,
        });
    }
    /**
     * Updates the chunk duration based on current system state.
     */
    update() {
        if (!this.tokenBucket || !this.queue || !this.aggregator) {
            return;
        }
        const state = this.assessState();
        // Apply smoothing to prevent rapid oscillation
        this.smoothedTargetDurationMs =
            this.smoothedTargetDurationMs * this.config.smoothingFactor +
                state.recommendedDurationMs * (1 - this.config.smoothingFactor);
        // Round to nearest 100ms
        const newTarget = Math.round(this.smoothedTargetDurationMs / 100) * 100;
        // Clamp to valid range
        const clampedTarget = Math.max(this.config.minChunkDurationMs, Math.min(this.config.maxChunkDurationMs, newTarget));
        // Check if we need to adjust
        if (clampedTarget !== this.currentTargetDurationMs) {
            const previousTarget = this.currentTargetDurationMs;
            this.currentTargetDurationMs = clampedTarget;
            this.lastAdjustmentTime = Date.now();
            this.adjustmentCount++;
            // Update the aggregator
            this.aggregator.setTargetDuration(clampedTarget);
            logger.info("Chunk duration adjusted", {
                previous: previousTarget,
                new: clampedTarget,
                loadLevel: state.loadLevel,
                tokenPercentage: (state.tokenPercentage * 100).toFixed(1) + "%",
                queueDepth: state.queueDepth,
            });
            this.emit("durationAdjusted", {
                previousDuration: previousTarget,
                newDuration: clampedTarget,
                loadLevel: state.loadLevel,
            });
        }
        // Check for load level changes
        if (state.loadLevel !== this.lastLoadLevel) {
            this.emit("loadLevelChanged", {
                previous: this.lastLoadLevel,
                current: state.loadLevel,
            });
            this.lastLoadLevel = state.loadLevel;
        }
    }
    /**
     * Assesses the current system state and determines recommended duration.
     */
    assessState() {
        const tokenPercentage = this.tokenBucket.getTokenPercentage();
        const queueDepth = this.queue.getLength();
        const queueStats = this.queue.getStats();
        // Determine load level
        let loadLevel = LoadLevel.NORMAL;
        let recommendedDurationMs = this.config.defaultChunkDurationMs;
        // Check for critical conditions
        const tokenCritical = tokenPercentage < 0.2;
        const queueCritical = queueDepth >= this.config.queueHighThreshold * 1.5;
        if (tokenCritical || queueCritical) {
            loadLevel = LoadLevel.CRITICAL;
            recommendedDurationMs = this.config.maxChunkDurationMs;
        }
        // Check for high load
        else if (tokenPercentage < this.config.tokenLowThreshold ||
            queueDepth >= this.config.queueHighThreshold) {
            loadLevel = LoadLevel.HIGH;
            recommendedDurationMs = this.config.highLoadChunkDurationMs;
        }
        // Check for elevated load
        else if (tokenPercentage < 0.6 ||
            queueDepth >= this.config.queueHighThreshold * 0.5) {
            loadLevel = LoadLevel.ELEVATED;
            recommendedDurationMs = this.config.underLoadChunkDurationMs;
        }
        // Factor in processing latency if available
        if (queueStats.avgWaitTimeMs > 2000) {
            // Chunks waiting too long, increase duration
            recommendedDurationMs = Math.max(recommendedDurationMs, this.config.underLoadChunkDurationMs);
        }
        return {
            loadLevel,
            currentTargetDurationMs: this.currentTargetDurationMs,
            tokenPercentage,
            queueDepth,
            recommendedDurationMs,
        };
    }
    /**
     * Gets the current state.
     */
    getState() {
        if (!this.tokenBucket || !this.queue) {
            return null;
        }
        return this.assessState();
    }
    /**
     * Gets the current target duration.
     */
    getCurrentTargetDuration() {
        return this.currentTargetDurationMs;
    }
    /**
     * Forces a specific duration (for testing or manual override).
     */
    forceTargetDuration(durationMs) {
        const clamped = Math.max(this.config.minChunkDurationMs, Math.min(this.config.maxChunkDurationMs, durationMs));
        this.currentTargetDurationMs = clamped;
        this.smoothedTargetDurationMs = clamped;
        if (this.aggregator) {
            this.aggregator.setTargetDuration(clamped);
        }
        logger.info("Target duration forced", { duration: clamped });
    }
    /**
     * Resets to default duration.
     */
    reset() {
        this.currentTargetDurationMs = this.config.defaultChunkDurationMs;
        this.smoothedTargetDurationMs = this.config.defaultChunkDurationMs;
        this.lastLoadLevel = LoadLevel.NORMAL;
        this.adjustmentCount = 0;
        if (this.aggregator) {
            this.aggregator.setTargetDuration(this.config.defaultChunkDurationMs);
        }
        logger.info("AdaptiveChunkController reset");
    }
    /**
     * Gets metrics.
     */
    getMetrics() {
        return {
            currentTargetDurationMs: this.currentTargetDurationMs,
            smoothedTargetDurationMs: this.smoothedTargetDurationMs,
            loadLevel: this.lastLoadLevel,
            adjustmentCount: this.adjustmentCount,
            lastAdjustmentTime: this.lastAdjustmentTime,
            isRunning: this.isRunning,
        };
    }
    /**
     * Gets the configuration.
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.AdaptiveChunkController = AdaptiveChunkController;
//# sourceMappingURL=AdaptiveChunkController.js.map