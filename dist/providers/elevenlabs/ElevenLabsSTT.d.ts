/**
 * ElevenLabs Speech-to-Text Provider (Phase 7.1)
 *
 * Implements batch STT using ElevenLabs Scribe v2 model.
 * Supports 90+ languages including Arabic and Urdu.
 *
 * API: POST https://api.elevenlabs.io/v1/speech-to-text
 * Auth: Header "xi-api-key: <API_KEY>"
 */
import { ISTTProvider, STTRequest, STTResponse } from "../types";
import { ElevenLabsConfig } from "./config";
/**
 * ElevenLabs Speech-to-Text Provider.
 *
 * Uses batch STT endpoint for transcription.
 * For lower latency, see WebSocket implementation in Phase 7.2.
 */
export declare class ElevenLabsSTT implements ISTTProvider {
    readonly name = "ElevenLabs-STT";
    readonly supportedLanguages: string[];
    private config;
    private requestCount;
    private errorCount;
    constructor(config: ElevenLabsConfig);
    /**
     * Transcribes audio to text using ElevenLabs Scribe v2.
     */
    transcribe(request: STTRequest): Promise<STTResponse>;
    /**
     * Checks if a language is supported.
     */
    supportsLanguage(language: string): boolean;
    /**
     * Checks provider health by making a minimal API call.
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
//# sourceMappingURL=ElevenLabsSTT.d.ts.map