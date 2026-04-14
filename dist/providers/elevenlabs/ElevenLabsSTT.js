"use strict";
/**
 * ElevenLabs Speech-to-Text Provider (Phase 7.1)
 *
 * Implements batch STT using ElevenLabs Scribe v2 model.
 * Supports 90+ languages including Arabic and Urdu.
 *
 * API: POST https://api.elevenlabs.io/v1/speech-to-text
 * Auth: Header "xi-api-key: <API_KEY>"
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsSTT = void 0;
const logger_1 = require("../../logger");
const types_1 = require("../types");
const config_1 = require("./config");
const logger = (0, logger_1.createLogger)("ElevenLabsSTT");
/**
 * ElevenLabs Speech-to-Text Provider.
 *
 * Uses batch STT endpoint for transcription.
 * For lower latency, see WebSocket implementation in Phase 7.2.
 */
class ElevenLabsSTT {
    name = "ElevenLabs-STT";
    supportedLanguages = config_1.ELEVENLABS_STT_LANGUAGES;
    config;
    requestCount = 0;
    errorCount = 0;
    constructor(config) {
        if (!config.apiKey) {
            throw new Error("ElevenLabs API key is required");
        }
        this.config = {
            apiKey: config.apiKey,
            baseUrl: config.baseUrl || config_1.DEFAULT_ELEVENLABS_CONFIG.baseUrl,
            timeoutMs: config.timeoutMs || config_1.DEFAULT_ELEVENLABS_CONFIG.timeoutMs,
        };
        logger.info("ElevenLabsSTT initialized", {
            baseUrl: this.config.baseUrl,
        });
    }
    /**
     * Transcribes audio to text using ElevenLabs Scribe v2.
     */
    async transcribe(request) {
        const url = `${this.config.baseUrl}${config_1.ELEVENLABS_API.STT_ENDPOINT}`;
        // Create multipart form data
        const formData = new FormData();
        // Audio file - ElevenLabs accepts various formats
        const audioBlob = new Blob([request.audioBuffer], { type: "audio/wav" });
        formData.append("file", audioBlob, "audio.wav");
        // Model selection
        formData.append("model_id", config_1.ELEVENLABS_STT_MODELS.SCRIBE_V2);
        // Language hint (optional but improves accuracy)
        if (request.language) {
            formData.append("language_code", request.language);
        }
        // Remove filler words (Yeah, Um, Uh) and false starts at model level
        // This produces cleaner text for the translation LLM
        formData.append("remove_disfluencies", "true");
        // Don't tag audio events ([clicking], [music]) — we filter them anyway
        // and suppressing at source avoids wasting pipeline cycles
        formData.append("tag_audio_events", "false");
        logger.debug("Sending STT request", {
            url,
            language: request.language,
            audioSize: request.audioBuffer.byteLength,
        });
        const startTime = Date.now();
        this.requestCount++;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "xi-api-key": this.config.apiKey,
                },
                body: formData,
                signal: AbortSignal.timeout(this.config.timeoutMs),
            });
            const latencyMs = Date.now() - startTime;
            if (!response.ok) {
                this.errorCount++;
                throw await this.createError(response);
            }
            const data = await response.json();
            logger.info("STT request completed", {
                latencyMs,
                textLength: data.text?.length || 0,
                detectedLanguage: data.language_code,
                confidence: data.language_probability,
            });
            return {
                text: data.text || "",
                detectedLanguage: data.language_code,
                confidence: data.language_probability,
                metadata: {
                    words: data.words,
                    provider: this.name,
                    latencyMs,
                },
            };
        }
        catch (error) {
            if (error instanceof types_1.ProviderError) {
                throw error;
            }
            this.errorCount++;
            throw new types_1.ProviderError(`STT request failed: ${error instanceof Error ? error.message : String(error)}`, this.name, 0, true);
        }
    }
    /**
     * Checks if a language is supported.
     */
    supportsLanguage(language) {
        return this.supportedLanguages.includes(language);
    }
    /**
     * Checks provider health by making a minimal API call.
     */
    async checkHealth() {
        const url = `${this.config.baseUrl}${config_1.ELEVENLABS_API.USER_ENDPOINT}`;
        const startTime = Date.now();
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "xi-api-key": this.config.apiKey,
                },
                signal: AbortSignal.timeout(5000),
            });
            const latencyMs = Date.now() - startTime;
            if (!response.ok) {
                return { healthy: false, latencyMs };
            }
            return { healthy: true, latencyMs };
        }
        catch {
            return { healthy: false };
        }
    }
    /**
     * Creates a ProviderError from a fetch response.
     */
    async createError(response) {
        const retryAfter = response.headers.get("retry-after");
        const retryAfterMs = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : undefined;
        // 429 Too Many Requests and 5xx errors are retryable
        const retryable = response.status === 429 || response.status >= 500;
        let message = `ElevenLabs STT error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                message = `ElevenLabs STT error: ${JSON.stringify(errorData.detail)}`;
            }
        }
        catch {
            // Body is not JSON
        }
        return new types_1.ProviderError(message, this.name, response.status, retryable, retryAfterMs);
    }
    /**
     * Gets client metrics.
     */
    getMetrics() {
        return {
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
        };
    }
}
exports.ElevenLabsSTT = ElevenLabsSTT;
//# sourceMappingURL=ElevenLabsSTT.js.map