"use strict";
/**
 * Configuration module for the Jitsi Translator Agent.
 * Loads settings from environment variables with sensible defaults.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.getDisplayName = getDisplayName;
exports.getMeetingUrl = getMeetingUrl;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const envParsing_1 = require("./utils/envParsing");
// Load .env file if present
dotenv.config({ path: path.resolve(__dirname, "../.env") });
/**
 * Loads and validates the agent configuration from environment variables.
 */
function loadConfig() {
    return {
        // Jitsi connection
        jitsiDomain: (0, envParsing_1.validateRequiredEnv)("JITSI_DOMAIN", process.env.JITSI_DOMAIN),
        roomName: (0, envParsing_1.validateRequiredEnv)("ROOM_NAME", process.env.ROOM_NAME),
        targetLanguage: process.env.TARGET_LANGUAGE || "en",
        sourceLanguage: process.env.SOURCE_LANGUAGE || "en", // Phase 4
        displayNamePrefix: process.env.AGENT_DISPLAY_NAME_PREFIX || "translator-",
        // Audio/Worklet settings (Phase 2)
        workletHeartbeatIntervalMs: (0, envParsing_1.parseIntEnv)(process.env.WORKLET_HEARTBEAT_INTERVAL_MS, 300),
        heartbeatTimeoutMs: (0, envParsing_1.parseIntEnv)(process.env.HEARTBEAT_TIMEOUT_MS, 1500),
        audioContextResumeRetries: (0, envParsing_1.parseIntEnv)(process.env.AUDIOCONTEXT_RESUME_RETRIES, 5),
        audioContextResumeBackoffMs: (0, envParsing_1.parseIntEnv)(process.env.AUDIOCONTEXT_RESUME_BACKOFF_MS, 500),
        // VAD settings (Phase 3)
        vadRmsThreshold: (0, envParsing_1.parseFloatEnv)(process.env.VAD_RMS_THRESHOLD, 0.015), // ~-36dB
        vadSmoothingFrames: (0, envParsing_1.parseIntEnv)(process.env.VAD_SMOOTHING_FRAMES, 3),
        vadSilenceCoalesceMs: (0, envParsing_1.parseIntEnv)(process.env.VAD_SILENCE_COALESCE_MS, 500),
        // Chunk aggregation settings (Phase 3)
        targetChunkDurationMs: (0, envParsing_1.parseIntEnv)(process.env.TARGET_CHUNK_DURATION_MS, 2000),
        minChunkDurationMs: (0, envParsing_1.parseIntEnv)(process.env.MIN_CHUNK_DURATION_MS, 1500),
        maxChunkDurationMs: (0, envParsing_1.parseIntEnv)(process.env.MAX_CHUNK_DURATION_MS, 3000),
        sampleRate: (0, envParsing_1.parseIntEnv)(process.env.AUDIO_SAMPLE_RATE, 48000),
        // Debug settings (Phase 3)
        debugMode: (0, envParsing_1.parseBoolEnv)(process.env.DEBUG_MODE, false),
        debugOutputDir: process.env.DEBUG_OUTPUT_DIR || "./debug_chunks",
        maxDebugChunks: (0, envParsing_1.parseIntEnv)(process.env.MAX_DEBUG_CHUNKS, 100),
        // Health check
        healthPort: (0, envParsing_1.parseIntEnv)(process.env.HEALTH_PORT, 8080),
        // Bot page server
        botPagePort: (0, envParsing_1.parseIntEnv)(process.env.BOT_PAGE_PORT, 3001),
        // Puppeteer settings
        chromeHeadless: (0, envParsing_1.parseBoolEnv)(process.env.CHROME_HEADLESS, true),
        chromeDevtools: (0, envParsing_1.parseBoolEnv)(process.env.CHROME_DEVTOOLS, false),
        // ============================================================================
        // ElevenLabs API settings (Phase 7.1)
        // ============================================================================
        elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "",
        elevenLabsBaseUrl: process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io/v1",
        elevenLabsTimeoutMs: (0, envParsing_1.parseIntEnv)(process.env.ELEVENLABS_TIMEOUT_MS, 30000),
        // ============================================================================
        // Mizan API settings (Phase 4, Translation only in Phase 7.1+)
        // ============================================================================
        mizanBaseUrl: process.env.MIZAN_BASE_URL || "https://platform.mizanlabs.com/api/v1",
        mizanUsername: process.env.MIZAN_USERNAME || "",
        mizanPassword: process.env.MIZAN_PASSWORD || "",
        mizanTimeoutMs: (0, envParsing_1.parseIntEnv)(process.env.MIZAN_TIMEOUT_MS, 30000),
        // Translation settings (Phase 4)
        translationTemplatePattern: process.env.TRANSLATION_TEMPLATE_PATTERN || "translator_{target}",
        ttsVoice: process.env.TTS_VOICE || "af_heart",
        ttsSpeed: (0, envParsing_1.parseFloatEnv)(process.env.TTS_SPEED, 1.0),
        // Rate limiting (Phase 4)
        tokenBucketCapacity: (0, envParsing_1.parseIntEnv)(process.env.TOKEN_BUCKET_CAPACITY, 8),
        tokenBucketRefillRate: (0, envParsing_1.parseIntEnv)(process.env.TOKEN_BUCKET_REFILL_RATE, 8),
        // Circuit breaker (Phase 4)
        circuitBreakerErrorThreshold: (0, envParsing_1.parseFloatEnv)(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD, 0.1),
        circuitBreakerWindowMs: (0, envParsing_1.parseIntEnv)(process.env.CIRCUIT_BREAKER_WINDOW_MS, 60000),
        circuitBreakerOpenTimeoutMs: (0, envParsing_1.parseIntEnv)(process.env.CIRCUIT_BREAKER_OPEN_TIMEOUT_MS, 10000),
        // Queue settings (Phase 4)
        maxQueueLength: (0, envParsing_1.parseIntEnv)(process.env.MAX_QUEUE_LENGTH, 12),
        maxInFlight: (0, envParsing_1.parseIntEnv)(process.env.MAX_IN_FLIGHT, 2),
        // Retry settings (Phase 4)
        retryInitialDelayMs: (0, envParsing_1.parseIntEnv)(process.env.RETRY_INITIAL_DELAY_MS, 500),
        retryMaxDelayMs: (0, envParsing_1.parseIntEnv)(process.env.RETRY_MAX_DELAY_MS, 8000),
        maxRetries: (0, envParsing_1.parseIntEnv)(process.env.MAX_RETRIES, 3),
        // Adaptive chunking (Phase 4)
        adaptiveChunkingEnabled: (0, envParsing_1.parseBoolEnv)(process.env.ADAPTIVE_CHUNKING_ENABLED, true),
        adaptiveUpdateIntervalMs: (0, envParsing_1.parseIntEnv)(process.env.ADAPTIVE_UPDATE_INTERVAL_MS, 1000),
        // Logging
        logLevel: process.env.LOG_LEVEL || "info",
    };
}
/**
 * Returns the display name for this translator agent.
 * Format: translator-<lang> (e.g., translator-en, translator-hi)
 */
function getDisplayName(config) {
    return `${config.displayNamePrefix}${config.targetLanguage}`;
}
/**
 * Returns the full Jitsi meeting URL.
 * Note: This is used for logging. Actual connection uses JitsiMeetExternalAPI.
 */
function getMeetingUrl(config) {
    const domain = config.jitsiDomain.replace(/\/$/, ""); // Remove trailing slash
    return `https://${domain}/${config.roomName}`;
}
//# sourceMappingURL=config.js.map