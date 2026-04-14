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
/**
 * Mizan API configuration.
 */
export interface MizanConfig {
    baseUrl: string;
    username: string;
    password: string;
    timeoutMs: number;
}
/**
 * Default Mizan configuration.
 */
export declare const DEFAULT_MIZAN_CONFIG: MizanConfig;
/**
 * STT request options.
 */
export interface STTRequest {
    audioBuffer: ArrayBuffer;
    language?: string;
    vadFilter?: boolean;
}
/**
 * STT response from Mizan.
 */
export interface STTResponse {
    message: string;
    audioType: string;
    asrResult: string;
}
/**
 * Translation request options.
 */
export interface TranslationRequest {
    text: string;
    templateName: string;
}
/**
 * Translation response from Mizan.
 */
export interface TranslationResponse {
    response: string;
}
/**
 * TTS request options.
 */
export interface TTSRequest {
    text: string;
    voice?: string;
    langCode?: TTSLanguageCode;
    speed?: number;
    stream?: boolean;
    responseFormat?: "mp3" | "opus" | "flac" | "wav" | "pcm";
}
/**
 * TTS language codes supported by Mizan.
 */
export type TTSLanguageCode = "a" | "b" | "j" | "z" | "e" | "f" | "h" | "i" | "p";
/**
 * TTS response (non-streaming).
 */
export interface TTSResponse {
    audioBuffer: ArrayBuffer;
    contentType: string;
}
/**
 * Mizan API error.
 */
export declare class MizanError extends Error {
    statusCode: number;
    retryable: boolean;
    retryAfterMs?: number | undefined;
    constructor(message: string, statusCode: number, retryable: boolean, retryAfterMs?: number | undefined);
}
/**
 * Mizan Labs API Client.
 */
export declare class MizanClient {
    private config;
    private authHeader;
    private requestCount;
    private errorCount;
    private lastRequestTime;
    constructor(config?: Partial<MizanConfig>);
    /**
     * Transcribes audio using Mizan STT.
     * POST /audio/transcriptions
     */
    transcribe(request: STTRequest): Promise<STTResponse>;
    /**
     * Translates text using Mizan LLM with a template.
     * POST /chat/completions?template_name=<name>
     */
    translate(request: TranslationRequest): Promise<TranslationResponse>;
    /**
     * Generates speech using Mizan TTS.
     * POST /audio/speech
     *
     * Returns the audio buffer directly (non-streaming).
     */
    synthesize(request: TTSRequest): Promise<TTSResponse>;
    /**
     * Generates speech with streaming response.
     * Returns an async iterable of audio chunks.
     */
    synthesizeStream(request: TTSRequest): AsyncGenerator<Uint8Array, void, undefined>;
    /**
     * Checks Mizan API health.
     * GET /health
     */
    checkHealth(): Promise<{
        healthy: boolean;
        db: string;
        llm: string;
        asr: string;
    }>;
    /**
     * Gets available TTS voices.
     * GET /audio/speech/voices
     */
    getVoices(): Promise<{
        id: string;
        name: string;
    }[]>;
    /**
     * Creates a MizanError from a fetch response.
     */
    private createError;
    /**
     * Safely reads response text without throwing.
     */
    private safeReadText;
    /**
     * Gets client metrics.
     */
    getMetrics(): {
        requestCount: number;
        errorCount: number;
        errorRate: number;
        lastRequestTime: number;
    };
    /**
     * Resets metrics.
     */
    resetMetrics(): void;
}
//# sourceMappingURL=MizanClient.d.ts.map