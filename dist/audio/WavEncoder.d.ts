/**
 * WAV Encoder for Audio Chunks (Phase 3)
 *
 * Encodes Float32 PCM audio data to WAV format with:
 * - Little Endian byte order (explicitly enforced)
 * - 16-bit signed integer samples
 * - Mono channel (1 channel)
 * - Configurable sample rate (default 48000Hz)
 *
 * Maximum file size constraint: 15MB (Mizan API limit)
 */
/**
 * WAV file metadata embedded in the chunk.
 */
export interface WavMetadata {
    chunkId: string;
    agentId: string;
    timestamp: number;
    durationMs: number;
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
}
/**
 * Encodes Float32 PCM samples to WAV format with Little Endian encoding.
 *
 * @param samples Float32Array of audio samples (-1.0 to 1.0)
 * @param metadata WAV metadata
 * @returns ArrayBuffer containing the WAV file
 */
export declare function encodeWav(samples: Float32Array, metadata: WavMetadata): ArrayBuffer;
/**
 * Validates a WAV buffer by checking the header.
 * Returns true if the buffer appears to be a valid WAV file.
 */
export declare function validateWav(buffer: ArrayBuffer): {
    valid: boolean;
    error?: string;
    info?: {
        sampleRate: number;
        channels: number;
        bitsPerSample: number;
        duration: number;
    };
};
/**
 * Generates a test tone WAV for validation purposes.
 * Creates a 440Hz sine wave at the specified duration.
 */
export declare function generateTestTone(durationMs: number, sampleRate?: number, frequency?: number): {
    samples: Float32Array;
    wavBuffer: ArrayBuffer;
};
//# sourceMappingURL=WavEncoder.d.ts.map