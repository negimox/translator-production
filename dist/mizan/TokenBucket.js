"use strict";
/**
 * Token Bucket Rate Limiter (Phase 4)
 *
 * Implements a token bucket algorithm for rate limiting Mizan API requests.
 *
 * Key parameters (from implementation plan):
 * - Provider quota: 10 req/s; conservative config: 8 tokens/sec
 * - Bucket capacity: 8 tokens
 * - Token cost per chunk pipeline: 3 tokens (STT, Translation, TTS)
 *
 * Features:
 * - Automatic token refill based on refill rate
 * - Wait-based and tryAcquire-based token acquisition
 * - Metrics for monitoring bucket state
 * - Events for low token warnings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIZAN_TOKEN_COSTS = exports.TokenBucket = exports.DEFAULT_TOKEN_BUCKET_CONFIG = void 0;
const events_1 = require("events");
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("TokenBucket");
/**
 * Default token bucket configuration per Phase 4 spec.
 */
exports.DEFAULT_TOKEN_BUCKET_CONFIG = {
    capacity: 8,
    refillRate: 8, // 8 tokens/sec
    lowTokenWarningThreshold: 0.4, // Warn when < 40% tokens
};
/**
 * Token Bucket implementation.
 */
class TokenBucket extends events_1.EventEmitter {
    config;
    tokens;
    lastRefillTime;
    // Metrics
    totalAcquisitions = 0;
    totalRejections = 0;
    totalWaitTimeMs = 0;
    // Warning state
    lowTokenWarningFired = false;
    constructor(config = {}) {
        super();
        this.config = { ...exports.DEFAULT_TOKEN_BUCKET_CONFIG, ...config };
        this.tokens = this.config.initialTokens ?? this.config.capacity;
        this.lastRefillTime = Date.now();
        logger.info("TokenBucket initialized", {
            capacity: this.config.capacity,
            refillRate: this.config.refillRate,
            initialTokens: this.tokens,
        });
    }
    /**
     * Refills tokens based on elapsed time since last refill.
     */
    refill() {
        const now = Date.now();
        const elapsedMs = now - this.lastRefillTime;
        const elapsedSec = elapsedMs / 1000;
        // Calculate tokens to add
        const tokensToAdd = elapsedSec * this.config.refillRate;
        if (tokensToAdd >= 1) {
            const previousTokens = this.tokens;
            this.tokens = Math.min(this.config.capacity, this.tokens + tokensToAdd);
            this.lastRefillTime = now;
            // Check if we've recovered from low tokens
            if (this.lowTokenWarningFired &&
                this.getTokenPercentage() >= this.config.lowTokenWarningThreshold) {
                this.lowTokenWarningFired = false;
                this.emit("tokensRecovered", {
                    tokens: this.tokens,
                    percentage: this.getTokenPercentage(),
                });
                logger.info("Token bucket recovered", {
                    tokens: this.tokens,
                    percentage: (this.getTokenPercentage() * 100).toFixed(1) + "%",
                });
            }
            logger.debug("Tokens refilled", {
                added: (this.tokens - previousTokens).toFixed(2),
                current: this.tokens.toFixed(2),
            });
        }
    }
    /**
     * Gets the current token percentage (0-1).
     */
    getTokenPercentage() {
        this.refill();
        return this.tokens / this.config.capacity;
    }
    /**
     * Tries to acquire tokens without waiting.
     * Returns immediately with the result.
     */
    tryAcquire(count = 1) {
        this.refill();
        if (this.tokens >= count) {
            this.tokens -= count;
            this.totalAcquisitions++;
            this.checkLowTokens();
            return {
                acquired: true,
                tokensAvailable: this.tokens,
            };
        }
        this.totalRejections++;
        // Calculate wait time needed
        const tokensNeeded = count - this.tokens;
        const waitTimeMs = (tokensNeeded / this.config.refillRate) * 1000;
        return {
            acquired: false,
            tokensAvailable: this.tokens,
            waitTimeMs,
        };
    }
    /**
     * Acquires tokens, waiting if necessary.
     * Returns a promise that resolves when tokens are acquired.
     */
    async acquire(count = 1) {
        // First try without waiting
        const tryResult = this.tryAcquire(count);
        if (tryResult.acquired) {
            return tryResult;
        }
        // Need to wait
        const waitTimeMs = tryResult.waitTimeMs || 0;
        logger.debug("Waiting for tokens", {
            requested: count,
            available: this.tokens,
            waitTimeMs,
        });
        const waitStart = Date.now();
        await this.sleep(waitTimeMs);
        // Try again after waiting
        const result = this.tryAcquire(count);
        if (result.acquired) {
            const actualWaitMs = Date.now() - waitStart;
            this.totalWaitTimeMs += actualWaitMs;
            return {
                ...result,
                waitTimeMs: actualWaitMs,
            };
        }
        // Still couldn't acquire - return with calculated wait time
        return result;
    }
    /**
     * Checks if we should fire a low token warning.
     */
    checkLowTokens() {
        const percentage = this.getTokenPercentage();
        if (!this.lowTokenWarningFired &&
            percentage < this.config.lowTokenWarningThreshold) {
            this.lowTokenWarningFired = true;
            this.emit("lowTokens", {
                tokens: this.tokens,
                percentage,
                threshold: this.config.lowTokenWarningThreshold,
            });
            logger.warn("Token bucket low", {
                tokens: this.tokens.toFixed(2),
                percentage: (percentage * 100).toFixed(1) + "%",
                threshold: (this.config.lowTokenWarningThreshold * 100).toFixed(1) + "%",
            });
        }
    }
    /**
     * Peeks at current token count without modifying state.
     */
    peek() {
        this.refill();
        return this.tokens;
    }
    /**
     * Returns tokens to the bucket (e.g., when an operation is cancelled).
     */
    release(count = 1) {
        this.tokens = Math.min(this.config.capacity, this.tokens + count);
        logger.debug("Tokens released", {
            released: count,
            current: this.tokens.toFixed(2),
        });
    }
    /**
     * Gets bucket metrics.
     */
    getMetrics() {
        this.refill();
        return {
            currentTokens: this.tokens,
            capacity: this.config.capacity,
            percentage: this.tokens / this.config.capacity,
            totalAcquisitions: this.totalAcquisitions,
            totalRejections: this.totalRejections,
            totalWaitTimeMs: this.totalWaitTimeMs,
            avgWaitTimeMs: this.totalAcquisitions > 0
                ? this.totalWaitTimeMs / this.totalAcquisitions
                : 0,
        };
    }
    /**
     * Resets the bucket to full capacity.
     */
    reset() {
        this.tokens = this.config.capacity;
        this.lastRefillTime = Date.now();
        this.totalAcquisitions = 0;
        this.totalRejections = 0;
        this.totalWaitTimeMs = 0;
        this.lowTokenWarningFired = false;
        logger.info("TokenBucket reset to full capacity");
    }
    /**
     * Dynamically updates the bucket capacity and refill rate.
     * Used by the orchestrator to implement fractional rate limiting
     * when multiple agents share a global quota.
     */
    updateConfig(capacity, refillRate) {
        this.config.capacity = capacity;
        this.config.refillRate = refillRate;
        // Cap current tokens to new capacity
        this.tokens = Math.min(this.tokens, capacity);
        logger.info("TokenBucket config updated", {
            capacity,
            refillRate,
            currentTokens: this.tokens,
        });
    }
    /**
     * Gets the configuration.
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Sleep utility.
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.TokenBucket = TokenBucket;
/**
 * Token costs for different Mizan operations.
 * Per Phase 4 spec: Token cost per chunk pipeline = 3 (STT, Translation, TTS)
 */
exports.MIZAN_TOKEN_COSTS = {
    STT: 1,
    TRANSLATION: 1,
    TTS: 1,
    FULL_PIPELINE: 3, // STT + Translation + TTS
};
//# sourceMappingURL=TokenBucket.js.map