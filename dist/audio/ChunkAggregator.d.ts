/**
 * Chunk Aggregator for Audio Processing (Phase 3)
 *
 * Receives audio frames from the browser AudioWorklet, applies VAD gating,
 * and assembles audio chunks for STT processing.
 *
 * Features:
 * - VAD-driven chunking with configurable RMS threshold
 * - Coalesces utterances separated by < 250ms silence
 * - Default chunk target: 900ms, adaptive up to 3000ms under load
 * - Generates WAV files with Little Endian encoding
 * - Metadata: chunkId, timestamp, agentId
 */
import { EventEmitter } from "events";
import { WavMetadata } from "./WavEncoder";
/**
 * Configuration for the chunk aggregator.
 */
export interface ChunkAggregatorConfig {
    agentId: string;
    sampleRate: number;
    vadRmsThreshold: number;
    vadSilenceCoalesceMs: number;
    targetChunkDurationMs: number;
    minChunkDurationMs: number;
    maxChunkDurationMs: number;
    adaptiveChunkingEnabled: boolean;
    debugMode: boolean;
}
/**
 * Default configuration values.
 */
export declare const DEFAULT_CHUNK_CONFIG: ChunkAggregatorConfig;
/**
 * Audio frame received from the AudioWorklet.
 */
export interface AudioFrame {
    samples: Float32Array;
    timestamp: number;
    isSpeech: boolean;
    rms: number;
}
/**
 * Completed audio chunk ready for STT.
 */
export interface AudioChunk {
    chunkId: string;
    agentId: string;
    timestamp: number;
    durationMs: number;
    sampleRate: number;
    samples: Float32Array;
    wavBuffer: ArrayBuffer;
    metadata: WavMetadata;
}
/**
 * Chunk Aggregator class.
 * Collects audio frames, applies VAD, and emits completed chunks.
 */
export declare class ChunkAggregator extends EventEmitter {
    private config;
    private state;
    private chunkCounter;
    private currentTargetDurationMs;
    private totalFramesReceived;
    private totalChunksEmitted;
    private droppedFrames;
    constructor(config?: Partial<ChunkAggregatorConfig>);
    /**
     * Creates the initial aggregator state.
     */
    private createInitialState;
    /**
     * Processes an incoming audio frame from the AudioWorklet.
     * This is the main entry point called from the Node.js bridge.
     */
    processFrame(frame: AudioFrame): void;
    /**
     * Handles a frame containing speech.
     */
    private handleSpeechFrame;
    /**
     * Handles a frame containing silence.
     */
    private handleSilenceFrame;
    /**
     * Checks if conditions are met to emit a chunk.
     */
    private checkAndEmitChunk;
    /**
     * Emits the current collected audio as a chunk.
     */
    private emitChunk;
    /**
     * Merges multiple Float32Arrays into one.
     */
    private mergeSamples;
    /**
     * Generates a unique chunk ID.
     */
    private generateChunkId;
    /**
     * Resets the aggregator state for next collection.
     */
    private resetState;
    /**
     * Forces emission of any pending audio (e.g., on shutdown).
     */
    flush(): void;
    /**
     * Updates the target chunk duration (for adaptive chunking in Phase 4).
     */
    setTargetDuration(durationMs: number): void;
    /**
     * Gets current target duration.
     */
    getTargetDuration(): number;
    /**
     * Gets aggregator metrics.
     */
    getMetrics(): {
        totalFramesReceived: number;
        totalChunksEmitted: number;
        droppedFrames: number;
        currentTargetDurationMs: number;
        isCollecting: boolean;
    };
    /**
     * Resets all metrics.
     */
    resetMetrics(): void;
}
//# sourceMappingURL=ChunkAggregator.d.ts.map