"use strict";
/**
 * Mizan Labs API Client (Phase 4)
 *
 * Handles communication with the Mizanlabs platform for:
 * - Speech-to-Text (STT): POST /audio/transcriptions
 * - Translation: POST /chat/completions?template_name=translator_<lang>
 * - Text-to-Speech (TTS): POST /audio/speech (with streaming support)
 *
 * Authentication: Basic Auth
 * Base URL: https://platform.mizanlabs.com/api/v1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MizanClient = exports.MizanError = exports.DEFAULT_MIZAN_CONFIG = void 0;
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("MizanClient");
/**
 * Default Mizan configuration.
 */
exports.DEFAULT_MIZAN_CONFIG = {
    baseUrl: "https://platform.mizanlabs.com/api/v1",
    username: "",
    password: "",
    timeoutMs: 30000,
};
/**
 * Mizan API error.
 */
class MizanError extends Error {
    statusCode;
    retryable;
    retryAfterMs;
    constructor(message, statusCode, retryable, retryAfterMs) {
        super(message);
        this.statusCode = statusCode;
        this.retryable = retryable;
        this.retryAfterMs = retryAfterMs;
        this.name = "MizanError";
    }
}
exports.MizanError = MizanError;
/**
 * Mizan Labs API Client.
 */
class MizanClient {
    config;
    authHeader;
    // Metrics
    requestCount = 0;
    errorCount = 0;
    lastRequestTime = 0;
    constructor(config = {}) {
        this.config = { ...exports.DEFAULT_MIZAN_CONFIG, ...config };
        // Validate required credentials
        if (!this.config.username || !this.config.password) {
            throw new Error("Mizan API credentials required (username and password)");
        }
        // Create Basic Auth header
        const credentials = `${this.config.username}:${this.config.password}`;
        this.authHeader = `Basic ${Buffer.from(credentials).toString("base64")}`;
        logger.info("MizanClient initialized", {
            baseUrl: this.config.baseUrl,
            username: this.config.username,
        });
    }
    /**
     * Transcribes audio using Mizan STT.
     * POST /audio/transcriptions
     */
    async transcribe(request) {
        const url = new URL(`${this.config.baseUrl}/audio/transcriptions`);
        // Add query parameters
        if (request.language) {
            url.searchParams.set("language", request.language);
        }
        url.searchParams.set("output", "json");
        if (request.vadFilter !== undefined) {
            url.searchParams.set("vad_filter", String(request.vadFilter));
        }
        // Create multipart form data
        const formData = new FormData();
        const audioBlob = new Blob([request.audioBuffer], { type: "audio/wav" });
        formData.append("audio_file", audioBlob, "audio.wav");
        logger.debug("Sending STT request", {
            url: url.toString(),
            language: request.language,
            audioSize: request.audioBuffer.byteLength,
        });
        const startTime = Date.now();
        this.requestCount++;
        this.lastRequestTime = startTime;
        try {
            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    Authorization: this.authHeader,
                },
                body: formData,
                signal: AbortSignal.timeout(this.config.timeoutMs),
            });
            const latencyMs = Date.now() - startTime;
            if (!response.ok) {
                this.errorCount++;
                throw this.createError(response, await this.safeReadText(response));
            }
            const data = await response.json();
            // asr_result is an object with shape: { language: string, segments: [], text: string }
            // Extract the text field from the asr_result object
            const asrResultObj = data.asr_result;
            const transcriptionText = typeof asrResultObj === "object" && asrResultObj !== null
                ? asrResultObj.text || ""
                : typeof asrResultObj === "string"
                    ? asrResultObj
                    : "";
            logger.info("STT request completed", {
                latencyMs,
                resultLength: transcriptionText.length,
                transcription: transcriptionText.substring(0, 100),
            });
            return {
                message: data.message || "",
                audioType: data.audio_type || "",
                asrResult: transcriptionText,
            };
        }
        catch (error) {
            if (error instanceof MizanError) {
                throw error;
            }
            this.errorCount++;
            throw new MizanError(`STT request failed: ${error instanceof Error ? error.message : String(error)}`, 0, true);
        }
    }
    /**
     * Translates text using Mizan LLM with a template.
     * POST /chat/completions?template_name=<name>
     */
    async translate(request) {
        const url = new URL(`${this.config.baseUrl}/chat/completions`);
        url.searchParams.set("template_name", request.templateName);
        logger.debug("Sending translation request", {
            templateName: request.templateName,
            textLength: request.text.length,
        });
        const startTime = Date.now();
        this.requestCount++;
        this.lastRequestTime = startTime;
        try {
            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    Authorization: this.authHeader,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: request.text }),
                signal: AbortSignal.timeout(this.config.timeoutMs),
            });
            const latencyMs = Date.now() - startTime;
            if (!response.ok) {
                this.errorCount++;
                throw this.createError(response, await this.safeReadText(response));
            }
            const data = await response.json();
            logger.info("Translation request completed", {
                latencyMs,
                responseLength: data.response?.length || 0,
                inputText: request.text,
                translatedText: data.response,
            });
            return {
                response: data.response,
            };
        }
        catch (error) {
            if (error instanceof MizanError) {
                throw error;
            }
            this.errorCount++;
            throw new MizanError(`Translation request failed: ${error instanceof Error ? error.message : String(error)}`, 0, true);
        }
    }
    /**
     * Generates speech using Mizan TTS.
     * POST /audio/speech
     *
     * Returns the audio buffer directly (non-streaming).
     */
    async synthesize(request) {
        const url = new URL(`${this.config.baseUrl}/audio/speech`);
        const body = {
            input: request.text,
            voice: request.voice || "af_heart",
            response_format: request.responseFormat || "mp3",
            speed: request.speed || 1,
            stream: request.stream || false,
            lang_code: request.langCode || "a",
        };
        logger.debug("Sending TTS request", {
            textLength: request.text.length,
            voice: body.voice,
            langCode: body.lang_code,
            stream: body.stream,
        });
        const startTime = Date.now();
        this.requestCount++;
        this.lastRequestTime = startTime;
        try {
            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    Authorization: this.authHeader,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(this.config.timeoutMs),
            });
            const latencyMs = Date.now() - startTime;
            if (!response.ok) {
                this.errorCount++;
                throw this.createError(response, await this.safeReadText(response));
            }
            const audioBuffer = await response.arrayBuffer();
            const contentType = response.headers.get("content-type") || "audio/mpeg";
            logger.info("TTS request completed", {
                latencyMs,
                audioSize: audioBuffer.byteLength,
                contentType,
            });
            return {
                audioBuffer,
                contentType,
            };
        }
        catch (error) {
            if (error instanceof MizanError) {
                throw error;
            }
            this.errorCount++;
            throw new MizanError(`TTS request failed: ${error instanceof Error ? error.message : String(error)}`, 0, true);
        }
    }
    /**
     * Generates speech with streaming response.
     * Returns an async iterable of audio chunks.
     */
    async *synthesizeStream(request) {
        const url = new URL(`${this.config.baseUrl}/audio/speech`);
        const body = {
            input: request.text,
            voice: request.voice || "af_heart",
            response_format: request.responseFormat || "mp3",
            speed: request.speed || 1,
            stream: true,
            lang_code: request.langCode || "a",
        };
        logger.debug("Sending streaming TTS request", {
            textLength: request.text.length,
            voice: body.voice,
        });
        const startTime = Date.now();
        this.requestCount++;
        this.lastRequestTime = startTime;
        try {
            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    Authorization: this.authHeader,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(this.config.timeoutMs),
            });
            if (!response.ok) {
                this.errorCount++;
                throw this.createError(response, await this.safeReadText(response));
            }
            if (!response.body) {
                throw new MizanError("Response body is null", 500, false);
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
            });
        }
        catch (error) {
            if (error instanceof MizanError) {
                throw error;
            }
            this.errorCount++;
            throw new MizanError(`TTS streaming failed: ${error instanceof Error ? error.message : String(error)}`, 0, true);
        }
    }
    /**
     * Checks Mizan API health.
     * GET /health
     */
    async checkHealth() {
        const url = `${this.config.baseUrl}/health`;
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: this.authHeader,
                },
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                return {
                    healthy: false,
                    db: "unknown",
                    llm: "unknown",
                    asr: "unknown",
                };
            }
            const data = await response.json();
            return {
                healthy: data.status === "healthy",
                db: data.checks?.db || "unknown",
                llm: data.checks?.llm || "unknown",
                asr: data.checks?.asr || "unknown",
            };
        }
        catch {
            return { healthy: false, db: "error", llm: "error", asr: "error" };
        }
    }
    /**
     * Gets available TTS voices.
     * GET /audio/speech/voices
     */
    async getVoices() {
        const url = `${this.config.baseUrl}/audio/speech/voices`;
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: this.authHeader,
                },
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) {
                throw this.createError(response, await this.safeReadText(response));
            }
            const data = await response.json();
            return data.voices || [];
        }
        catch (error) {
            logger.error("Failed to fetch voices", { error: String(error) });
            return [];
        }
    }
    /**
     * Creates a MizanError from a fetch response.
     */
    createError(response, body) {
        const retryAfter = response.headers.get("retry-after");
        const retryAfterMs = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : undefined;
        // 429 Too Many Requests is retryable
        // 5xx errors are retryable
        const retryable = response.status === 429 || response.status >= 500;
        let message = `Mizan API error: ${response.status} ${response.statusText}`;
        try {
            const errorData = JSON.parse(body);
            if (errorData.error) {
                message = `Mizan API error: ${errorData.error}`;
            }
        }
        catch {
            // Body is not JSON
        }
        return new MizanError(message, response.status, retryable, retryAfterMs);
    }
    /**
     * Safely reads response text without throwing.
     */
    async safeReadText(response) {
        try {
            return await response.text();
        }
        catch {
            return "";
        }
    }
    /**
     * Gets client metrics.
     */
    getMetrics() {
        return {
            requestCount: this.requestCount,
            errorCount: this.errorCount,
            errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
            lastRequestTime: this.lastRequestTime,
        };
    }
    /**
     * Resets metrics.
     */
    resetMetrics() {
        this.requestCount = 0;
        this.errorCount = 0;
        this.lastRequestTime = 0;
    }
}
exports.MizanClient = MizanClient;
//# sourceMappingURL=MizanClient.js.map