"use strict";
/**
 * Provider Factory (Phase 7.1)
 *
 * Factory for creating and managing STT, Translation, and TTS providers.
 * Supports ElevenLabs (STT/TTS) and Mizan (Translation).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = void 0;
exports.initializeProviderFactory = initializeProviderFactory;
exports.getProviderFactory = getProviderFactory;
const logger_1 = require("../logger");
const ElevenLabsSTT_1 = require("./elevenlabs/ElevenLabsSTT");
const ElevenLabsTTS_1 = require("./elevenlabs/ElevenLabsTTS");
const MizanTranslation_1 = require("./mizan/MizanTranslation");
const logger = (0, logger_1.createLogger)("ProviderFactory");
/**
 * Provider Factory.
 *
 * Creates and caches provider instances for reuse.
 * Ensures singleton pattern for each provider type.
 */
class ProviderFactory {
    config;
    instances = {
        stt: new Map(),
        translation: new Map(),
        tts: new Map(),
    };
    constructor(config) {
        this.config = config;
        // Validate required configurations
        if (!config.elevenlabs?.apiKey) {
            logger.warn("ElevenLabs API key not configured - STT/TTS will fail");
        }
        if (!config.mizan?.username || !config.mizan?.password) {
            logger.warn("Mizan credentials not configured - Translation will fail");
        }
        logger.info("ProviderFactory initialized", {
            hasElevenLabs: !!config.elevenlabs?.apiKey,
            hasMizan: !!config.mizan?.username,
        });
    }
    /**
     * Gets an STT provider instance.
     */
    getSTTProvider(type = "elevenlabs") {
        const cached = this.instances.stt.get(type);
        if (cached) {
            return cached;
        }
        let provider;
        switch (type) {
            case "elevenlabs":
                if (!this.config.elevenlabs?.apiKey) {
                    throw new Error("ElevenLabs API key not configured");
                }
                provider = new ElevenLabsSTT_1.ElevenLabsSTT({
                    apiKey: this.config.elevenlabs.apiKey,
                    baseUrl: this.config.elevenlabs.baseUrl,
                    timeoutMs: this.config.elevenlabs.timeoutMs,
                });
                break;
            default:
                throw new Error(`Unknown STT provider type: ${type}`);
        }
        this.instances.stt.set(type, provider);
        logger.info("STT provider created", { type, name: provider.name });
        return provider;
    }
    /**
     * Gets a Translation provider instance.
     */
    getTranslationProvider(type = "mizan") {
        const cached = this.instances.translation.get(type);
        if (cached) {
            return cached;
        }
        let provider;
        switch (type) {
            case "mizan":
                if (!this.config.mizan?.username || !this.config.mizan?.password) {
                    throw new Error("Mizan credentials not configured");
                }
                provider = new MizanTranslation_1.MizanTranslation({
                    username: this.config.mizan.username,
                    password: this.config.mizan.password,
                    baseUrl: this.config.mizan.baseUrl,
                    timeoutMs: this.config.mizan.timeoutMs,
                    templatePattern: this.config.mizan.templatePattern,
                });
                break;
            default:
                throw new Error(`Unknown Translation provider type: ${type}`);
        }
        this.instances.translation.set(type, provider);
        logger.info("Translation provider created", { type, name: provider.name });
        return provider;
    }
    /**
     * Gets a TTS provider instance.
     */
    getTTSProvider(type = "elevenlabs") {
        const cached = this.instances.tts.get(type);
        if (cached) {
            return cached;
        }
        let provider;
        switch (type) {
            case "elevenlabs":
                if (!this.config.elevenlabs?.apiKey) {
                    throw new Error("ElevenLabs API key not configured");
                }
                provider = new ElevenLabsTTS_1.ElevenLabsTTS({
                    apiKey: this.config.elevenlabs.apiKey,
                    baseUrl: this.config.elevenlabs.baseUrl,
                    timeoutMs: this.config.elevenlabs.timeoutMs,
                });
                break;
            default:
                throw new Error(`Unknown TTS provider type: ${type}`);
        }
        this.instances.tts.set(type, provider);
        logger.info("TTS provider created", { type, name: provider.name });
        return provider;
    }
    /**
     * Checks health of all configured providers.
     */
    async checkAllHealth() {
        const results = {
            stt: {},
            translation: {},
            tts: {},
        };
        // Check STT providers
        for (const [type, provider] of this.instances.stt) {
            results.stt[type] = await provider.checkHealth();
        }
        // Check Translation providers
        for (const [type, provider] of this.instances.translation) {
            results.translation[type] = await provider.checkHealth();
        }
        // Check TTS providers
        for (const [type, provider] of this.instances.tts) {
            results.tts[type] = await provider.checkHealth();
        }
        return results;
    }
    /**
     * Clears all cached provider instances.
     */
    clearInstances() {
        this.instances.stt.clear();
        this.instances.translation.clear();
        this.instances.tts.clear();
        logger.info("All provider instances cleared");
    }
    /**
     * Gets all supported languages for STT.
     */
    getSTTSupportedLanguages() {
        try {
            const provider = this.getSTTProvider();
            return provider.supportedLanguages;
        }
        catch {
            return [];
        }
    }
    /**
     * Gets all supported languages for TTS.
     */
    getTTSSupportedLanguages() {
        try {
            const provider = this.getTTSProvider();
            return provider.supportedLanguages;
        }
        catch {
            return [];
        }
    }
    /**
     * Gets all supported language pairs for translation.
     */
    getTranslationSupportedPairs() {
        try {
            const provider = this.getTranslationProvider();
            return provider.supportedLanguagePairs;
        }
        catch {
            return [];
        }
    }
}
exports.ProviderFactory = ProviderFactory;
/**
 * Singleton factory instance.
 */
let factoryInstance = null;
/**
 * Initializes the global provider factory.
 */
function initializeProviderFactory(config) {
    factoryInstance = new ProviderFactory(config);
    return factoryInstance;
}
/**
 * Gets the global provider factory instance.
 * Must call initializeProviderFactory first.
 */
function getProviderFactory() {
    if (!factoryInstance) {
        throw new Error("ProviderFactory not initialized. Call initializeProviderFactory first.");
    }
    return factoryInstance;
}
//# sourceMappingURL=ProviderFactory.js.map