/**
 * Circuit Breaker Pattern Implementation (Phase 4)
 *
 * Protects against cascading failures when Mizan API is degraded.
 *
 * Key parameters (from implementation plan):
 * - Open when error rate ≥ 10% over 60s
 * - Open timeout: 10s
 * - Half-open probes after timeout
 *
 * States:
 * - CLOSED: Normal operation, requests flow through
 * - OPEN: Circuit tripped, requests fail fast
 * - HALF_OPEN: Testing if service recovered
 */
import { EventEmitter } from "events";
/**
 * Circuit breaker states.
 */
export declare enum CircuitState {
    CLOSED = "closed",
    OPEN = "open",
    HALF_OPEN = "half_open"
}
/**
 * Circuit breaker configuration.
 */
export interface CircuitBreakerConfig {
    errorThreshold: number;
    errorWindowMs: number;
    openTimeoutMs: number;
    halfOpenSuccessThreshold: number;
    halfOpenTestCalls: number;
    minCallsBeforeTripping: number;
}
/**
 * Default circuit breaker configuration per Phase 4 spec.
 */
export declare const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig;
/**
 * Circuit breaker event data.
 */
export interface CircuitBreakerEvent {
    state: CircuitState;
    previousState: CircuitState;
    errorRate?: number;
    reason?: string;
}
/**
 * Circuit Breaker implementation.
 */
export declare class CircuitBreaker extends EventEmitter {
    private config;
    private state;
    private callHistory;
    private openedAt;
    private halfOpenSuccessCount;
    private halfOpenCallCount;
    private totalCalls;
    private totalSuccesses;
    private totalFailures;
    private totalRejections;
    private tripCount;
    constructor(config?: Partial<CircuitBreakerConfig>);
    /**
     * Gets the current circuit state.
     */
    getState(): CircuitState;
    /**
     * Checks if a request should be allowed through.
     * Returns true if allowed, false if circuit is open.
     */
    allowRequest(): boolean;
    /**
     * Records a successful call.
     */
    recordSuccess(): void;
    /**
     * Records a failed call.
     */
    recordFailure(): void;
    /**
     * Adds a call record to history.
     */
    private addCallRecord;
    /**
     * Removes call records outside the error window.
     */
    private pruneHistory;
    /**
     * Calculates the current error rate within the window.
     */
    getErrorRate(): number;
    /**
     * Checks if the circuit should be tripped based on error rate.
     */
    private checkAndTrip;
    /**
     * Transitions to a new state.
     */
    private transitionTo;
    /**
     * Forces the circuit open (for manual intervention).
     */
    forceOpen(reason?: string): void;
    /**
     * Forces the circuit closed (for manual intervention).
     */
    forceClose(reason?: string): void;
    /**
     * Executes a function with circuit breaker protection.
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Gets remaining time until circuit attempts half-open.
     */
    getRemainingOpenTimeMs(): number | null;
    /**
     * Gets circuit breaker metrics.
     */
    getMetrics(): {
        state: CircuitState;
        errorRate: number;
        totalCalls: number;
        totalSuccesses: number;
        totalFailures: number;
        totalRejections: number;
        tripCount: number;
        callsInWindow: number;
        remainingOpenTimeMs: number | null;
    };
    /**
     * Resets all metrics and state.
     */
    reset(): void;
}
/**
 * Error thrown when circuit is open.
 */
export declare class CircuitOpenError extends Error {
    circuitState: CircuitState;
    retryAfterMs: number | null;
    constructor(message: string, circuitState: CircuitState, retryAfterMs: number | null);
}
//# sourceMappingURL=CircuitBreaker.d.ts.map