/**
 * ElevenLabs Configuration (Phase 7.1)
 *
 * Voice mappings, model selection, and API configuration
 * for ElevenLabs STT and TTS services.
 */
import { VoiceConfig } from "../types";
/**
 * ElevenLabs API endpoints.
 */
export declare const ELEVENLABS_API: {
    BASE_URL: string;
    STT_ENDPOINT: string;
    TTS_ENDPOINT: string;
    VOICES_ENDPOINT: string;
    USER_ENDPOINT: string;
};
/**
 * ElevenLabs TTS models.
 */
export declare const ELEVENLABS_MODELS: {
    /** Best quality for Urdu and 70+ languages */
    readonly ELEVEN_V3: "eleven_v3";
    /** Low latency (~75ms), 32 languages - NO Urdu */
    readonly ELEVEN_FLASH_V2_5: "eleven_flash_v2_5";
    /** Standard quality, 29 languages - NO Urdu */
    readonly ELEVEN_MULTILINGUAL_V2: "eleven_multilingual_v2";
    /** Fast turbo model */
    readonly ELEVEN_TURBO_V2_5: "eleven_turbo_v2_5";
};
/**
 * ElevenLabs STT models.
 */
export declare const ELEVENLABS_STT_MODELS: {
    /** Batch STT model - 90+ languages */
    readonly SCRIBE_V2: "scribe_v2";
    /** Realtime WebSocket STT - ~150ms latency */
    readonly SCRIBE_V2_REALTIME: "scribe_v2_realtime";
};
/**
 * Voice configurations per language.
 * Based on elevenlabs_voices.json analysis (April 2026).
 *
 * Key findings:
 * - Sarah (EXAVITQu4vr4xnSDxMaL): Only voice verified for Arabic, also has Hindi
 * - Nichalia (acCWxmzPBgXdHwA63uzP): Best multi-language voice (18 langs), Hindi verified
 * - Roger (CwhRBWXzGAHq8TQ4Fs17): Male English voice with flash support
 * - No Urdu-verified voices - must use eleven_v3 model
 */
export declare const ELEVENLABS_VOICES: Record<string, VoiceConfig>;
/**
 * Gets the voice configuration for a language.
 * Falls back to eleven_v3 with Sarah voice for unsupported languages.
 */
export declare function getVoiceConfig(language: string): VoiceConfig;
/**
 * Selects the TTS model based on target language.
 * - Urdu requires eleven_v3 (only model with Urdu support)
 * - Arabic uses multilingual_v2 (verified quality)
 * - Other languages use flash for lowest latency
 */
export declare function selectTTSModel(targetLanguage: string): string;
/**
 * Supported languages for ElevenLabs STT (Scribe v2).
 * Scribe v2 supports 90+ languages including:
 */
export declare const ELEVENLABS_STT_LANGUAGES: string[];
/**
 * Supported languages for ElevenLabs TTS.
 * eleven_v3 supports 70+ languages.
 * eleven_flash_v2_5 supports 32 languages (NO Urdu).
 */
export declare const ELEVENLABS_TTS_LANGUAGES: string[];
/**
 * ElevenLabs rate limits (Creator Plan - $22/mo).
 */
export declare const ELEVENLABS_RATE_LIMITS: {
    /** TTS concurrent requests (v2/v3 models) */
    TTS_CONCURRENCY_V2_V3: number;
    /** TTS concurrent requests (Flash model) */
    TTS_CONCURRENCY_FLASH: number;
    /** STT concurrent requests */
    STT_CONCURRENCY: number;
    /** Monthly credits */
    MONTHLY_CREDITS: number;
};
/**
 * Default ElevenLabs configuration.
 */
export interface ElevenLabsConfig {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
}
export declare const DEFAULT_ELEVENLABS_CONFIG: Omit<ElevenLabsConfig, "apiKey">;
//# sourceMappingURL=config.d.ts.map