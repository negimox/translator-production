/**
 * Translation Pipeline Orchestrator (Phase 4 / Updated Phase 7.1)
 *
 * Coordinates the full translation pipeline:
 * Audio Chunk → STT → Translation → TTS → Audio Output
 *
 * Provider Support (Phase 7.1):
 * - STT: ElevenLabs (Scribe v2) or Mizan
 * - Translation: Mizan (template-based)
 * - TTS: ElevenLabs (streaming) or Mizan
 *
 * Features:
 * - Rate limiting via TokenBucket
 * - Circuit breaker for fault tolerance
 * - Priority queue for chunk processing
 * - Adaptive chunking based on load
 * - Retry with exponential backoff
 * - Comprehensive metrics and monitoring
 *
 * Key parameters (from implementation plan):
 * - Retry/backoff: 500ms initial, max 8s, max 3 retries per chunk
 * - Pipeline token cost: 3 tokens (STT + Translation + TTS)
 */
import { EventEmitter } from "events";
import { AudioChunk } from "../audio/ChunkAggregator";
import { MizanConfig } from "./MizanClient";
import { TokenBucket } from "./TokenBucket";
import { CircuitBreaker, CircuitState } from "./CircuitBreaker";
import { ChunkQueue } from "./ChunkQueue";
import { ProviderFactory } from "../providers";
/**
 * Translation pipeline configuration.
 */
export interface TranslationPipelineConfig {
    mizan: Partial<MizanConfig>;
    sourceLanguage: string;
    targetLanguage: string;
    translationTemplatePattern: string;
    ttsVoice: string;
    ttsSpeed: number;
    retryInitialDelayMs: number;
    retryMaxDelayMs: number;
    maxRetries: number;
    processIntervalMs: number;
    tokenBucketCapacity: number;
    tokenBucketRefillRate: number;
    circuitBreakerErrorThreshold: number;
    circuitBreakerWindowMs: number;
    circuitBreakerOpenTimeoutMs: number;
    maxQueueLength: number;
    maxInFlight: number;
    debugMode: boolean;
    debugOutputDir: string;
    /** Provider factory for ElevenLabs+Mizan mode */
    providerFactory?: ProviderFactory;
    /** Use ElevenLabs for STT/TTS (true) or Mizan for all (false) */
    useElevenLabs?: boolean;
}
/**
 * Default pipeline configuration per Phase 4 spec.
 */
export declare const DEFAULT_PIPELINE_CONFIG: TranslationPipelineConfig;
/**
 * Pipeline result for a processed chunk.
 */
export interface PipelineResult {
    chunkId: string;
    success: boolean;
    transcription?: string;
    translation?: string;
    audioBuffer?: ArrayBuffer;
    error?: string;
    latencyMs: number;
    retries: number;
}
/**
 * Pipeline metrics.
 */
export interface PipelineMetrics {
    totalChunksReceived: number;
    totalChunksProcessed: number;
    totalChunksDropped: number;
    totalChunksFailed: number;
    avgPipelineLatencyMs: number;
    avgSttLatencyMs: number;
    avgTranslationLatencyMs: number;
    avgTtsLatencyMs: number;
    tokenBucket: ReturnType<TokenBucket["getMetrics"]>;
    circuitBreaker: ReturnType<CircuitBreaker["getMetrics"]>;
    queue: ReturnType<ChunkQueue["getStats"]>;
    isProcessing: boolean;
    circuitState: CircuitState;
}
/**
 * Translation Pipeline Orchestrator.
 */
export declare class TranslationPipeline extends EventEmitter {
    private config;
    private mizanClient;
    private tokenBucket;
    private circuitBreaker;
    private queue;
    private sttProvider;
    private translationProvider;
    private ttsProvider;
    private isRunning;
    private processInterval;
    private previousTranscription;
    private totalChunksReceived;
    private totalChunksProcessed;
    private totalChunksDropped;
    private totalChunksFailed;
    private totalPipelineLatencyMs;
    private totalSttLatencyMs;
    private totalTranslationLatencyMs;
    private totalTtsLatencyMs;
    private onAudioReady;
    constructor(config?: Partial<TranslationPipelineConfig>);
    /**
     * Sets up event handlers for components.
     */
    private setupEventHandlers;
    /**
     * Sets the callback for when translated audio is ready.
     */
    setOnAudioReady(callback: (audio: ArrayBuffer, chunkId: string) => void): void;
    /**
     * Starts the pipeline processing loop.
     */
    start(): void;
    /**
     * Stops the pipeline.
     */
    stop(): void;
    /**
     * Submits a chunk for translation.
     */
    submitChunk(chunk: AudioChunk, speakerId?: string): boolean;
    /**
     * Sets the active speaker for prioritization.
     */
    setActiveSpeaker(speakerId: string | null): void;
    /**
     * Processes the next chunk in the queue.
     */
    private processNextChunk;
    /**
     * Processes a single chunk through the full pipeline.
     */
    private processChunk;
    /**
     * Runs the full translation pipeline for a chunk.
     * Uses ElevenLabs providers when configured, otherwise falls back to Mizan.
     */
    private runPipeline;
    /**
     * Checks if a transcription should be skipped.
     * Filters out non-speech artifacts and filler-only micro-transcriptions
     * that produce garbled or meaningless TTS output.
     */
    private shouldSkipTranscription;
    /**
     * Runs pipeline with ElevenLabs STT/TTS + Mizan Translation (Phase 7.1).
     */
    private runPipelineWithProviders;
    /**
     * Runs pipeline with Mizan for all stages (legacy mode).
     */
    private runPipelineWithMizan;
    /**
     * Saves TTS audio to a debug file for manual verification.
     */
    private saveTTSDebugFile;
    /**
     * Executes a function with retry and exponential backoff.
     */
    private executeWithRetry;
    /**
     * Checks if an error is retryable.
     */
    private isRetryableError;
    /**
     * Gets the translation template name based on source/target languages.
     */
    private getTranslationTemplateName;
    /**
     * Maps target language to TTS language code.
     */
    private getTTSLanguageCode;
    /**
     * Returns the optimal TTS voice for a given target language.
     * This is a static utility so the orchestrator can also use it
     * to pass the correct TTS_VOICE env var to child agents.
     */
    static getVoiceForLanguage(language: string): string;
    /**
     * Gets pipeline metrics.
     */
    getMetrics(): PipelineMetrics;
    /**
     * Checks if the pipeline is healthy.
     */
    isHealthy(): boolean;
    /**
     * Gets the token bucket for adaptive chunking.
     */
    getTokenBucket(): TokenBucket;
    /**
     * Gets the chunk queue.
     */
    getQueue(): ChunkQueue;
    /**
     * Gets the circuit breaker.
     */
    getCircuitBreaker(): CircuitBreaker;
    /**
     * Sleep utility.
     */
    private sleep;
}
//# sourceMappingURL=TranslationPipeline.d.ts.map