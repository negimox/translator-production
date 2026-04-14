/**
 * Provider Factory (Phase 7.1)
 *
 * Factory for creating and managing STT, Translation, and TTS providers.
 * Supports ElevenLabs (STT/TTS) and Mizan (Translation).
 */
import { ISTTProvider, ITranslationProvider, ITTSProvider } from "./types";
/**
 * Available provider types.
 */
export type STTProviderType = "elevenlabs";
export type TranslationProviderType = "mizan";
export type TTSProviderType = "elevenlabs";
/**
 * Provider factory configuration.
 */
export interface ProviderFactoryConfig {
    elevenlabs?: {
        apiKey: string;
        baseUrl?: string;
        timeoutMs?: number;
    };
    mizan?: {
        username: string;
        password: string;
        baseUrl?: string;
        timeoutMs?: number;
        templatePattern?: string;
    };
}
/**
 * Provider Factory.
 *
 * Creates and caches provider instances for reuse.
 * Ensures singleton pattern for each provider type.
 */
export declare class ProviderFactory {
    private config;
    private instances;
    constructor(config: ProviderFactoryConfig);
    /**
     * Gets an STT provider instance.
     */
    getSTTProvider(type?: STTProviderType): ISTTProvider;
    /**
     * Gets a Translation provider instance.
     */
    getTranslationProvider(type?: TranslationProviderType): ITranslationProvider;
    /**
     * Gets a TTS provider instance.
     */
    getTTSProvider(type?: TTSProviderType): ITTSProvider;
    /**
     * Checks health of all configured providers.
     */
    checkAllHealth(): Promise<{
        stt: {
            [key: string]: {
                healthy: boolean;
                latencyMs?: number;
            };
        };
        translation: {
            [key: string]: {
                healthy: boolean;
                latencyMs?: number;
            };
        };
        tts: {
            [key: string]: {
                healthy: boolean;
                latencyMs?: number;
            };
        };
    }>;
    /**
     * Clears all cached provider instances.
     */
    clearInstances(): void;
    /**
     * Gets all supported languages for STT.
     */
    getSTTSupportedLanguages(): string[];
    /**
     * Gets all supported languages for TTS.
     */
    getTTSSupportedLanguages(): string[];
    /**
     * Gets all supported language pairs for translation.
     */
    getTranslationSupportedPairs(): Array<{
        source: string;
        target: string;
    }>;
}
/**
 * Initializes the global provider factory.
 */
export declare function initializeProviderFactory(config: ProviderFactoryConfig): ProviderFactory;
/**
 * Gets the global provider factory instance.
 * Must call initializeProviderFactory first.
 */
export declare function getProviderFactory(): ProviderFactory;
//# sourceMappingURL=ProviderFactory.d.ts.map