/**
 * ElevenLabs Text-to-Speech Provider (Phase 7.1)
 *
 * Implements TTS using ElevenLabs streaming API.
 * Supports 70+ languages with model selection based on language.
 *
 * API: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream
 * Auth: Header "xi-api-key: <API_KEY>"
 */
import { ITTSProvider, TTSRequest, TTSResponse } from "../types";
import { ElevenLabsConfig } from "./config";
/**
 * ElevenLabs Text-to-Speech Provider.
 *
 * Features:
 * - Automatic model selection (eleven_v3 for Urdu, flash for others)
 * - Streaming support for low latency first-chunk delivery
 * - Voice configuration per language
 */
export declare class ElevenLabsTTS implements ITTSProvider {
    readonly name = "ElevenLabs-TTS";
    readonly supportedLanguages: string[];
    private config;
    private requestCount;
    private errorCount;
    constructor(config: ElevenLabsConfig);
    /**
     * Synthesizes speech from text (non-streaming).
     */
    synthesize(request: TTSRequest): Promise<TTSResponse>;
    /**
     * Synthesizes speech with streaming response.
     * Returns audio chunks as they become available.
     */
    synthesizeStream(request: TTSRequest): AsyncGenerator<Uint8Array, void, undefined>;
    /**
     * Checks if a language is supported.
     */
    supportsLanguage(language: string): boolean;
    /**
     * Gets the default voice ID for a language.
     */
    getDefaultVoice(language: string): string | undefined;
    /**
     * Checks provider health.
     */
    checkHealth(): Promise<{
        healthy: boolean;
        latencyMs?: number;
    }>;
    /**
     * Creates a ProviderError from a fetch response.
     */
    private createError;
    /**
     * Gets client metrics.
     */
    getMetrics(): {
        requestCount: number;
        errorCount: number;
        errorRate: number;
    };
}
//# sourceMappingURL=ElevenLabsTTS.d.ts.map