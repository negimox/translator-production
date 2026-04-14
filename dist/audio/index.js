"use strict";
/**
 * Index exports for the audio module.
 *
 * Phase 3 additions:
 * - ChunkAggregator: VAD-driven audio chunking
 * - WavEncoder: Float32 to WAV encoding
 * - AudioBridge: Node.js ↔ Browser audio bridge
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BRIDGE_CONFIG = exports.AudioBridge = exports.generateTestTone = exports.validateWav = exports.encodeWav = exports.DEFAULT_CHUNK_CONFIG = exports.ChunkAggregator = exports.HeartbeatMonitor = exports.AudioManager = void 0;
// Phase 2 components
var AudioContextManager_1 = require("./AudioContextManager");
Object.defineProperty(exports, "AudioManager", { enumerable: true, get: function () { return AudioContextManager_1.AudioManager; } });
var HeartbeatMonitor_1 = require("./HeartbeatMonitor");
Object.defineProperty(exports, "HeartbeatMonitor", { enumerable: true, get: function () { return HeartbeatMonitor_1.HeartbeatMonitor; } });
// Phase 3 components
var ChunkAggregator_1 = require("./ChunkAggregator");
Object.defineProperty(exports, "ChunkAggregator", { enumerable: true, get: function () { return ChunkAggregator_1.ChunkAggregator; } });
Object.defineProperty(exports, "DEFAULT_CHUNK_CONFIG", { enumerable: true, get: function () { return ChunkAggregator_1.DEFAULT_CHUNK_CONFIG; } });
var WavEncoder_1 = require("./WavEncoder");
Object.defineProperty(exports, "encodeWav", { enumerable: true, get: function () { return WavEncoder_1.encodeWav; } });
Object.defineProperty(exports, "validateWav", { enumerable: true, get: function () { return WavEncoder_1.validateWav; } });
Object.defineProperty(exports, "generateTestTone", { enumerable: true, get: function () { return WavEncoder_1.generateTestTone; } });
var AudioBridge_1 = require("./AudioBridge");
Object.defineProperty(exports, "AudioBridge", { enumerable: true, get: function () { return AudioBridge_1.AudioBridge; } });
Object.defineProperty(exports, "DEFAULT_BRIDGE_CONFIG", { enumerable: true, get: function () { return AudioBridge_1.DEFAULT_BRIDGE_CONFIG; } });
//# sourceMappingURL=index.js.map