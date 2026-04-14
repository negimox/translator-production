"use strict";
/**
 * Audio Bridge for Node.js ↔ Browser communication (Phase 3)
 *
 * Uses Puppeteer's page.exposeFunction() to receive audio frames
 * from the browser's AudioWorklet and forward them to the ChunkAggregator.
 *
 * Also handles writing debug WAV files to disk for validation.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioBridge = exports.DEFAULT_BRIDGE_CONFIG = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../logger");
const ChunkAggregator_1 = require("./ChunkAggregator");
const WavEncoder_1 = require("./WavEncoder");
const logger = (0, logger_1.createLogger)("AudioBridge");
/**
 * Default audio bridge configuration.
 */
exports.DEFAULT_BRIDGE_CONFIG = {
    aggregatorConfig: {},
    debugMode: false,
    debugOutputDir: "./debug_chunks",
    maxDebugChunks: 100,
    onChunk: undefined,
};
/**
 * Audio Bridge class.
 * Bridges browser audio to Node.js for processing.
 */
class AudioBridge {
    config;
    page;
    aggregator;
    isRunning = false;
    framesReceived = 0;
    debugChunkCount = 0;
    // Exposed function name in browser
    CALLBACK_NAME = "__onTranslatorAudioFrame";
    constructor(page, config = {}) {
        this.config = { ...exports.DEFAULT_BRIDGE_CONFIG, ...config };
        this.page = page;
        // Create chunk aggregator
        this.aggregator = new ChunkAggregator_1.ChunkAggregator(this.config.aggregatorConfig);
        // Set up chunk event listener
        this.aggregator.on("chunk", (chunk) => this.handleChunk(chunk));
        logger.info("AudioBridge created", {
            debugMode: this.config.debugMode,
            debugOutputDir: this.config.debugOutputDir,
        });
    }
    /**
     * Starts the audio bridge.
     * Exposes the callback function and registers it with the AudioManager.
     */
    async start() {
        if (this.isRunning) {
            logger.warn("AudioBridge already running");
            return;
        }
        logger.info("Starting AudioBridge");
        // Ensure debug directory exists
        if (this.config.debugMode) {
            await this.ensureDebugDirectory();
        }
        // Expose the callback function to the browser
        await this.page.exposeFunction(this.CALLBACK_NAME, (frame) => {
            this.handleBrowserFrame(frame);
        });
        logger.info("Exposed audio callback to browser", {
            callbackName: this.CALLBACK_NAME,
        });
        this.isRunning = true;
        // Start periodic status logging in debug mode
        if (this.config.debugMode) {
            this.startStatusLogging();
        }
    }
    /**
     * Starts periodic status logging for debugging.
     */
    startStatusLogging() {
        const statusInterval = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(statusInterval);
                return;
            }
            const metrics = this.aggregator.getMetrics();
            logger.info("Audio bridge status", {
                framesReceived: this.framesReceived,
                chunksGenerated: this.debugChunkCount,
                ...metrics,
            });
            // If no frames received after 10 seconds, log a warning
            if (this.framesReceived === 0) {
                logger.warn("No audio frames received from browser! Check if participants are unmuted and audio is flowing.");
            }
        }, 5000); // Log every 5 seconds
    }
    /**
     * Gets the callback name for registration with AudioManager.
     */
    getCallbackName() {
        return this.CALLBACK_NAME;
    }
    /**
     * Handles an audio frame received from the browser.
     */
    handleBrowserFrame(frame) {
        this.framesReceived++;
        // Log first frame received
        if (this.framesReceived === 1) {
            logger.info("🎤 First audio frame received from browser!", {
                rms: frame.rms.toFixed(4),
                isSpeech: frame.isSpeech,
                sampleCount: frame.samples.length,
            });
        }
        // Convert samples array back to Float32Array
        const samples = new Float32Array(frame.samples);
        // Create AudioFrame for aggregator
        const audioFrame = {
            samples,
            timestamp: frame.timestamp,
            isSpeech: frame.isSpeech,
            rms: frame.rms,
        };
        // Send to aggregator for chunking
        this.aggregator.processFrame(audioFrame);
        // Log periodically (every ~21 seconds at 48kHz/128 samples)
        if (this.framesReceived % 1000 === 0) {
            logger.debug("Audio frames received", {
                total: this.framesReceived,
                aggregatorMetrics: this.aggregator.getMetrics(),
            });
        }
    }
    /**
     * Handles a completed chunk from the aggregator.
     */
    handleChunk(chunk) {
        logger.info("Chunk ready", {
            chunkId: chunk.chunkId,
            durationMs: chunk.durationMs.toFixed(0),
            wavSize: chunk.wavBuffer.byteLength,
        });
        // Save debug chunk if enabled
        if (this.config.debugMode) {
            this.saveDebugChunk(chunk);
        }
        // Call external handler if provided
        if (this.config.onChunk) {
            try {
                this.config.onChunk(chunk);
            }
            catch (error) {
                logger.error("Error in onChunk callback", { error: String(error) });
            }
        }
    }
    /**
     * Saves a chunk to the debug directory for validation.
     */
    async saveDebugChunk(chunk) {
        if (this.debugChunkCount >= this.config.maxDebugChunks) {
            logger.debug("Max debug chunks reached, skipping save");
            return;
        }
        try {
            const filename = `chunk_${chunk.chunkId}.wav`;
            const filepath = path.join(this.config.debugOutputDir, filename);
            // Write WAV buffer to file
            const buffer = Buffer.from(chunk.wavBuffer);
            fs.writeFileSync(filepath, buffer);
            // Validate the written file
            const validation = (0, WavEncoder_1.validateWav)(chunk.wavBuffer);
            this.debugChunkCount++;
            logger.info("Debug chunk saved", {
                filepath,
                chunkId: chunk.chunkId,
                durationMs: chunk.durationMs.toFixed(0),
                fileSize: buffer.length,
                valid: validation.valid,
                wavInfo: validation.info,
            });
            // Write metadata JSON alongside
            const metadataPath = filepath.replace(".wav", ".json");
            const metadata = {
                ...chunk.metadata,
                validation: validation,
                savedAt: new Date().toISOString(),
            };
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
        }
        catch (error) {
            logger.error("Failed to save debug chunk", { error: String(error) });
        }
    }
    /**
     * Ensures the debug output directory exists.
     */
    async ensureDebugDirectory() {
        const dir = this.config.debugOutputDir;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logger.info("Created debug directory", { dir });
        }
    }
    /**
     * Generates and saves a test tone for WAV validation.
     * This can be used to verify the WAV encoder is working correctly.
     */
    async generateTestToneFile(durationMs = 1000) {
        const { wavBuffer } = (0, WavEncoder_1.generateTestTone)(durationMs);
        await this.ensureDebugDirectory();
        const filename = `test_tone_${Date.now()}.wav`;
        const filepath = path.join(this.config.debugOutputDir, filename);
        const buffer = Buffer.from(wavBuffer);
        fs.writeFileSync(filepath, buffer);
        // Validate
        const validation = (0, WavEncoder_1.validateWav)(wavBuffer);
        logger.info("Test tone generated", {
            filepath,
            durationMs,
            fileSize: buffer.length,
            valid: validation.valid,
            wavInfo: validation.info,
        });
        return filepath;
    }
    /**
     * Stops the audio bridge and flushes any pending audio.
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }
        logger.info("Stopping AudioBridge");
        // Flush any pending audio
        this.aggregator.flush();
        this.isRunning = false;
        logger.info("AudioBridge stopped", {
            totalFramesReceived: this.framesReceived,
            metrics: this.aggregator.getMetrics(),
        });
    }
    /**
     * Gets the chunk aggregator for direct access.
     */
    getAggregator() {
        return this.aggregator;
    }
    /**
     * Gets bridge metrics.
     */
    getMetrics() {
        return {
            framesReceived: this.framesReceived,
            debugChunkCount: this.debugChunkCount,
            isRunning: this.isRunning,
            aggregatorMetrics: this.aggregator.getMetrics(),
        };
    }
}
exports.AudioBridge = AudioBridge;
//# sourceMappingURL=AudioBridge.js.map