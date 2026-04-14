/**
 * Mizan Translation Provider (Phase 7.1)
 *
 * Implements translation using Mizan Labs API with template-based approach.
 * Templates: translator_{target} (e.g., translator_en, translator_hi, translator_ar, translator_ur)
 *
 * API: POST https://platform.mizanlabs.com/api/v1/chat/completions?template_name=<name>
 * Auth: Basic Auth
 */
import { ITranslationProvider, TranslationRequest, TranslationResponse } from "../types";
/**
 * Mizan API configuration.
 */
export interface MizanTranslationConfig {
    baseUrl: string;
    username: string;
    password: string;
    timeoutMs: number;
    /** Template pattern - use {target} placeholder */
    templatePattern: string;
}
/**
 * Default configuration.
 */
export declare const DEFAULT_MIZAN_TRANSLATION_CONFIG: Omit<MizanTranslationConfig, "username" | "password">;
/**
 * Mizan Translation Provider.
 *
 * Uses template-based translation with Mizan LLM API.
 * Templates are pre-configured on Mizan platform.
 */
export declare class MizanTranslation implements ITranslationProvider {
    readonly name = "Mizan-Translation";
    readonly supportedLanguagePairs: {
        source: string;
        target: string;
    }[];
    private config;
    private authHeader;
    private requestCount;
    private errorCount;
    constructor(config: Partial<MizanTranslationConfig> & {
        username: string;
        password: string;
    });
    /**
     * Translates text from source to target language.
     */
    translate(request: TranslationRequest): Promise<TranslationResponse>;
    /**
     * Checks if a language pair is supported.
     */
    supportsLanguagePair(source: string, target: string): boolean;
    /**
     * Checks provider health.
     */
    checkHealth(): Promise<{
        healthy: boolean;
        latencyMs?: number;
    }>;
    /**
     * Gets the template name for a target language.
     */
    private getTemplateName;
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
//# sourceMappingURL=MizanTranslation.d.ts.map