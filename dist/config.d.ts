/**
 * Configuration module for the Jitsi Translator Agent.
 * Loads settings from environment variables with sensible defaults.
 */
/**
 * Agent configuration interface.
 */
export interface AgentConfig {
    jitsiDomain: string;
    roomName: string;
    targetLanguage: string;
    sourceLanguage: string;
    displayNamePrefix: string;
    workletHeartbeatIntervalMs: number;
    heartbeatTimeoutMs: number;
    audioContextResumeRetries: number;
    audioContextResumeBackoffMs: number;
    vadRmsThreshold: number;
    vadSmoothingFrames: number;
    vadSilenceCoalesceMs: number;
    targetChunkDurationMs: number;
    minChunkDurationMs: number;
    maxChunkDurationMs: number;
    sampleRate: number;
    debugMode: boolean;
    debugOutputDir: string;
    maxDebugChunks: number;
    healthPort: number;
    botPagePort: number;
    chromeHeadless: boolean;
    chromeDevtools: boolean;
    elevenLabsApiKey: string;
    elevenLabsBaseUrl: string;
    elevenLabsTimeoutMs: number;
    mizanBaseUrl: string;
    mizanUsername: string;
    mizanPassword: string;
    mizanTimeoutMs: number;
    translationTemplatePattern: string;
    ttsVoice: string;
    ttsSpeed: number;
    tokenBucketCapacity: number;
    tokenBucketRefillRate: number;
    circuitBreakerErrorThreshold: number;
    circuitBreakerWindowMs: number;
    circuitBreakerOpenTimeoutMs: number;
    maxQueueLength: number;
    maxInFlight: number;
    retryInitialDelayMs: number;
    retryMaxDelayMs: number;
    maxRetries: number;
    adaptiveChunkingEnabled: boolean;
    adaptiveUpdateIntervalMs: number;
    logLevel: "debug" | "info" | "warn" | "error";
}
/**
 * Loads and validates the agent configuration from environment variables.
 */
export declare function loadConfig(): AgentConfig;
/**
 * Returns the display name for this translator agent.
 * Format: translator-<lang> (e.g., translator-en, translator-hi)
 */
export declare function getDisplayName(config: AgentConfig): string;
/**
 * Returns the full Jitsi meeting URL.
 * Note: This is used for logging. Actual connection uses JitsiMeetExternalAPI.
 */
export declare function getMeetingUrl(config: AgentConfig): string;
//# sourceMappingURL=config.d.ts.map