"use strict";
/**
 * Provider Abstraction Layer - Type Definitions (Phase 7.1)
 *
 * Defines interfaces for STT, Translation, and TTS providers
 * allowing seamless switching between Mizan and ElevenLabs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderError = void 0;
/**
 * Provider error with retry information.
 */
class ProviderError extends Error {
    provider;
    statusCode;
    retryable;
    retryAfterMs;
    constructor(message, provider, statusCode, retryable, retryAfterMs) {
        super(message);
        this.provider = provider;
        this.statusCode = statusCode;
        this.retryable = retryable;
        this.retryAfterMs = retryAfterMs;
        this.name = "ProviderError";
    }
}
exports.ProviderError = ProviderError;
//# sourceMappingURL=types.js.map