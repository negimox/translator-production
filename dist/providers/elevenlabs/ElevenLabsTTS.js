"use strict";
/**
 * ElevenLabs Text-to-Speech Provider (Phase 7.1)
 *
 * Implements TTS using ElevenLabs streaming API.
 * Supports 70+ languages with model selection based on language.
 *
 * API: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream
 * Auth: Header "xi-api-key: <API_KEY>"
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsTTS = void 0;
const logger_1 = require("../../logger");
const types_1 = require("../types");
const config_1 = require("./config");
const logger = (0, logger_1.createLogger)("ElevenLabsTTS");
/**
 * Output format mapping.
 */
const OUTPUT_FORMAT_MAP = {
    mp3: "mp3_44100_128",
    wav: "pcm_44100",
    pcm: "pcm_16000",
    opus: "opus_16000",
};
/**
 * ElevenLabs Text-to-Speech Provider.
 *
 * Features:
 * - Automatic model selection (eleven_v3 for Urdu, flash for others)
 * - Streaming support for low latency first-chunk delivery
 * - Voice configuration per language
 */
class ElevenLabsTTS {
    name = "ElevenLabs-TTS";
    supportedLanguages = config_1.ELEVENLABS_TTS_LANGUAGES;
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
        logger.info("ElevenLabsTTS initialized", {
            baseUrl: this.config.baseUrl,
            configuredVoices: Object.keys(config_1.ELEVENLABS_VOICES),
        });
    }
    /**
     * Synthesizes speech from text (non-streaming).
     */
    async synthesize(request) {
        const voiceConfig = (0, config_1.getVoiceConfig)(request.language);
        const voiceId = request.voiceId || voiceConfig.voiceId;
        const model = voiceConfig.model;
        const outputFormat = OUTPUT_FORMAT_MAP[request.outputFormat || "mp3"] || "mp3_44100_128";
        const url = `${this.config.baseUrl}${config_1.ELEVENLABS_API.TTS_ENDPOINT}/${voiceId}?output_format=${outputFormat}`;
        const body = {
            text: request.text,
            model_id: model,
            language_code: request.language,
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0,
                use_speaker_boost: true,
            },
        };
        logger.debug("Sending TTS request", {
            url,
            language: request.language,
            voiceId,
            model,
            textLength: request.text.length,
            verified: voiceConfig.verified,
        });
        const startTime = Date.now();
        this.requestCount++;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "xi-api-key": this.config.apiKey,
                    "Content-Type": "application/json",
                    Accept: "audio/mpeg",
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(this.config.timeoutMs),
            });
            const latencyMs = Date.now() - startTime;
            if (!response.ok) {
                this.errorCount++;
                throw await this.createError(response);
            }
            const audioBuffer = await response.arrayBuffer();
            const contentType = response.headers.get("content-type") || "audio/mpeg";
            logger.info("TTS request completed", {
                latencyMs,
                audioSize: audioBuffer.byteLength,
                contentType,
                voiceId,
                model,
            });
            return {
                audioBuffer,
                contentType,
            };
        }
        catch (error) {
            if (error instanceof types_1.ProviderError) {
                throw error;
            }
            this.errorCount++;
            throw new types_1.ProviderError(`TTS request failed: ${error instanceof Error ? error.message : String(error)}`, this.name, 0, true);
        }
    }
    /**
     * Synthesizes speech with streaming response.
     * Returns audio chunks as they become available.
     */
    async *synthesizeStream(request) {
        const voiceConfig = (0, config_1.getVoiceConfig)(request.language);
        const voiceId = request.voiceId || voiceConfig.voiceId;
        const model = voiceConfig.model;
        // Use streaming endpoint
        const outputFormat = OUTPUT_FORMAT_MAP[request.outputFormat || "mp3"] || "mp3_44100_128";
        const url = `${this.config.baseUrl}${config_1.ELEVENLABS_API.TTS_ENDPOINT}/${voiceId}/stream?output_format=${outputFormat}`;
        const body = {
            text: request.text,
            model_id: model,
            language_code: request.language,
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0,
                use_speaker_boost: true,
            },
        };
        logger.debug("Sending streaming TTS request", {
            url,
            language: request.language,
            voiceId,
            model,
            textLength: request.text.length,
        });
        const startTime = Date.now();
        this.requestCount++;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "xi-api-key": this.config.apiKey,
                    "Content-Type": "application/json",
                    Accept: "audio/mpeg",
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(this.config.timeoutMs),
            });
            if (!response.ok) {
                this.errorCount++;
                throw await this.createError(response);
            }
            if (!response.body) {
                throw new types_1.ProviderError("Response body is null", this.name, 500, false);
            }
            const reader = response.body.getReader();
            let totalBytes = 0;
            let firstChunkTime = null;
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    if (firstChunkTime === null) {
                        firstChunkTime = Date.now();
                        logger.debug("TTS first chunk received", {
                            latencyMs: firstChunkTime - startTime,
                            chunkSize: value.length,
                        });
                    }
                    totalBytes += value.length;
                    yield value;
                }
            }
            finally {
                reader.releaseLock();
            }
            logger.info("TTS streaming completed", {
                totalLatencyMs: Date.now() - startTime,
                firstChunkLatencyMs: firstChunkTime ? firstChunkTime - startTime : null,
                totalBytes,
                voiceId,
                model,
            });
        }
        catch (error) {
            if (error instanceof types_1.ProviderError) {
                throw error;
            }
            this.errorCount++;
            throw new types_1.ProviderError(`TTS streaming failed: ${error instanceof Error ? error.message : String(error)}`, this.name, 0, true);
        }
    }
    /**
     * Checks if a language is supported.
     */
    supportsLanguage(language) {
        return this.supportedLanguages.includes(language);
    }
    /**
     * Gets the default voice ID for a language.
     */
    getDefaultVoice(language) {
        const config = config_1.ELEVENLABS_VOICES[language];
        return config?.voiceId;
    }
    /**
     * Checks provider health.
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
        const retryable = response.status === 429 || response.status >= 500;
        let message = `ElevenLabs TTS error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                message = `ElevenLabs TTS error: ${JSON.stringify(errorData.detail)}`;
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
exports.ElevenLabsTTS = ElevenLabsTTS;
//# sourceMappingURL=ElevenLabsTTS.js.map