"use strict";
/**
 * ElevenLabs Module Exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ELEVENLABS_CONFIG = exports.selectTTSModel = exports.getVoiceConfig = exports.ELEVENLABS_RATE_LIMITS = exports.ELEVENLABS_TTS_LANGUAGES = exports.ELEVENLABS_STT_LANGUAGES = exports.ELEVENLABS_VOICES = exports.ELEVENLABS_STT_MODELS = exports.ELEVENLABS_MODELS = exports.ELEVENLABS_API = exports.ElevenLabsTTS = exports.ElevenLabsSTT = void 0;
var ElevenLabsSTT_1 = require("./ElevenLabsSTT");
Object.defineProperty(exports, "ElevenLabsSTT", { enumerable: true, get: function () { return ElevenLabsSTT_1.ElevenLabsSTT; } });
var ElevenLabsTTS_1 = require("./ElevenLabsTTS");
Object.defineProperty(exports, "ElevenLabsTTS", { enumerable: true, get: function () { return ElevenLabsTTS_1.ElevenLabsTTS; } });
var config_1 = require("./config");
Object.defineProperty(exports, "ELEVENLABS_API", { enumerable: true, get: function () { return config_1.ELEVENLABS_API; } });
Object.defineProperty(exports, "ELEVENLABS_MODELS", { enumerable: true, get: function () { return config_1.ELEVENLABS_MODELS; } });
Object.defineProperty(exports, "ELEVENLABS_STT_MODELS", { enumerable: true, get: function () { return config_1.ELEVENLABS_STT_MODELS; } });
Object.defineProperty(exports, "ELEVENLABS_VOICES", { enumerable: true, get: function () { return config_1.ELEVENLABS_VOICES; } });
Object.defineProperty(exports, "ELEVENLABS_STT_LANGUAGES", { enumerable: true, get: function () { return config_1.ELEVENLABS_STT_LANGUAGES; } });
Object.defineProperty(exports, "ELEVENLABS_TTS_LANGUAGES", { enumerable: true, get: function () { return config_1.ELEVENLABS_TTS_LANGUAGES; } });
Object.defineProperty(exports, "ELEVENLABS_RATE_LIMITS", { enumerable: true, get: function () { return config_1.ELEVENLABS_RATE_LIMITS; } });
Object.defineProperty(exports, "getVoiceConfig", { enumerable: true, get: function () { return config_1.getVoiceConfig; } });
Object.defineProperty(exports, "selectTTSModel", { enumerable: true, get: function () { return config_1.selectTTSModel; } });
Object.defineProperty(exports, "DEFAULT_ELEVENLABS_CONFIG", { enumerable: true, get: function () { return config_1.DEFAULT_ELEVENLABS_CONFIG; } });
//# sourceMappingURL=index.js.map