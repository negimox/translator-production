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
import { EventEmitter } from "events";
/**
 * Token bucket configuration.
 */
export interface TokenBucketConfig {
    capacity: number;
    refillRate: number;
    initialTokens?: number;
    lowTokenWarningThreshold: number;
}
/**
 * Default token bucket configuration per Phase 4 spec.
 */
export declare const DEFAULT_TOKEN_BUCKET_CONFIG: TokenBucketConfig;
/**
 * Token acquisition result.
 */
export interface TokenAcquisitionResult {
    acquired: boolean;
    tokensAvailable: number;
    waitTimeMs?: number;
}
/**
 * Token Bucket implementation.
 */
export declare class TokenBucket extends EventEmitter {
    private config;
    private tokens;
    private lastRefillTime;
    private totalAcquisitions;
    private totalRejections;
    private totalWaitTimeMs;
    private lowTokenWarningFired;
    constructor(config?: Partial<TokenBucketConfig>);
    /**
     * Refills tokens based on elapsed time since last refill.
     */
    private refill;
    /**
     * Gets the current token percentage (0-1).
     */
    getTokenPercentage(): number;
    /**
     * Tries to acquire tokens without waiting.
     * Returns immediately with the result.
     */
    tryAcquire(count?: number): TokenAcquisitionResult;
    /**
     * Acquires tokens, waiting if necessary.
     * Returns a promise that resolves when tokens are acquired.
     */
    acquire(count?: number): Promise<TokenAcquisitionResult>;
    /**
     * Checks if we should fire a low token warning.
     */
    private checkLowTokens;
    /**
     * Peeks at current token count without modifying state.
     */
    peek(): number;
    /**
     * Returns tokens to the bucket (e.g., when an operation is cancelled).
     */
    release(count?: number): void;
    /**
     * Gets bucket metrics.
     */
    getMetrics(): {
        currentTokens: number;
        capacity: number;
        percentage: number;
        totalAcquisitions: number;
        totalRejections: number;
        totalWaitTimeMs: number;
        avgWaitTimeMs: number;
    };
    /**
     * Resets the bucket to full capacity.
     */
    reset(): void;
    /**
     * Dynamically updates the bucket capacity and refill rate.
     * Used by the orchestrator to implement fractional rate limiting
     * when multiple agents share a global quota.
     */
    updateConfig(capacity: number, refillRate: number): void;
    /**
     * Gets the configuration.
     */
    getConfig(): TokenBucketConfig;
    /**
     * Sleep utility.
     */
    private sleep;
}
/**
 * Token costs for different Mizan operations.
 * Per Phase 4 spec: Token cost per chunk pipeline = 3 (STT, Translation, TTS)
 */
export declare const MIZAN_TOKEN_COSTS: {
    readonly STT: 1;
    readonly TRANSLATION: 1;
    readonly TTS: 1;
    readonly FULL_PIPELINE: 3;
};
//# sourceMappingURL=TokenBucket.d.ts.map