/**
 * Audio Bridge for Node.js ↔ Browser communication (Phase 3)
 *
 * Uses Puppeteer's page.exposeFunction() to receive audio frames
 * from the browser's AudioWorklet and forward them to the ChunkAggregator.
 *
 * Also handles writing debug WAV files to disk for validation.
 */
import { Page } from "puppeteer";
import { ChunkAggregator, AudioChunk, ChunkAggregatorConfig } from "./ChunkAggregator";
export { AudioChunk };
/**
 * Configuration for the audio bridge.
 */
export interface AudioBridgeConfig {
    aggregatorConfig: Partial<ChunkAggregatorConfig>;
    debugMode: boolean;
    debugOutputDir: string;
    maxDebugChunks: number;
    onChunk?: (chunk: AudioChunk) => void;
}
/**
 * Default audio bridge configuration.
 */
export declare const DEFAULT_BRIDGE_CONFIG: AudioBridgeConfig;
/**
 * Audio Bridge class.
 * Bridges browser audio to Node.js for processing.
 */
export declare class AudioBridge {
    private config;
    private page;
    private aggregator;
    private isRunning;
    private framesReceived;
    private debugChunkCount;
    private readonly CALLBACK_NAME;
    constructor(page: Page, config?: Partial<AudioBridgeConfig>);
    /**
     * Starts the audio bridge.
     * Exposes the callback function and registers it with the AudioManager.
     */
    start(): Promise<void>;
    /**
     * Starts periodic status logging for debugging.
     */
    private startStatusLogging;
    /**
     * Gets the callback name for registration with AudioManager.
     */
    getCallbackName(): string;
    /**
     * Handles an audio frame received from the browser.
     */
    private handleBrowserFrame;
    /**
     * Handles a completed chunk from the aggregator.
     */
    private handleChunk;
    /**
     * Saves a chunk to the debug directory for validation.
     */
    private saveDebugChunk;
    /**
     * Ensures the debug output directory exists.
     */
    private ensureDebugDirectory;
    /**
     * Generates and saves a test tone for WAV validation.
     * This can be used to verify the WAV encoder is working correctly.
     */
    generateTestToneFile(durationMs?: number): Promise<string>;
    /**
     * Stops the audio bridge and flushes any pending audio.
     */
    stop(): Promise<void>;
    /**
     * Gets the chunk aggregator for direct access.
     */
    getAggregator(): ChunkAggregator;
    /**
     * Gets bridge metrics.
     */
    getMetrics(): {
        framesReceived: number;
        debugChunkCount: number;
        isRunning: boolean;
        aggregatorMetrics: ReturnType<ChunkAggregator["getMetrics"]>;
    };
}
//# sourceMappingURL=AudioBridge.d.ts.map