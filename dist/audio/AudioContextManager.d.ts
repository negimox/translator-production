/**
 * AudioContext Manager for the Translator Agent.
 *
 * Handles:
 * - AudioContext creation and state management
 * - AudioWorklet setup with inline code (avoiding file path issues)
 * - GC prevention for both capture and output nodes
 * - MediaStreamDestination for publishing translated audio
 * - VAD (Voice Activity Detection) via RMS energy threshold (Phase 3)
 */
import { Page } from "puppeteer";
import { AgentConfig } from "../config";
/**
 * Health status of the audio infrastructure.
 */
export interface AudioHealth {
    contextState: "suspended" | "running" | "closed";
    captureActive: boolean;
    outputActive: boolean;
    playback: {
        trackPublished: boolean;
        trackMuted: boolean;
        destinationActive: boolean;
        queueLength: number;
        isPlaying: boolean;
    };
}
/**
 * Audio Manager class.
 * Manages AudioContext, worklets, and MediaStream nodes in the browser.
 */
export declare class AudioManager {
    private config;
    private page;
    private initialized;
    constructor(config: AgentConfig, page: Page);
    /**
     * Initializes the audio infrastructure in the browser.
     */
    initialize(): Promise<void>;
    /**
     * Registers a callback function for audio frames (Phase 3).
     * The callback is called in the browser context via page.exposeFunction().
     */
    registerAudioFrameCallback(callbackName: string): Promise<void>;
    /**
     * Connects all existing participants' audio to the capture worklet.
     * This should be called AFTER registerAudioFrameCallback() to ensure
     * all audio data is properly forwarded to Node.js.
     */
    connectExistingParticipants(): Promise<{
        connected: number;
        skipped: number;
        errors: number;
    }>;
    /**
     * Verifies and potentially resumes the AudioContext.
     */
    private verifyAudioContext;
    /**
     * Publishes the translated audio track to the Jitsi conference (Phase 5).
     *
     * Calls the browser-side publishTranslatedAudioTrack() which:
     * 1. Overrides getUserMedia to return MediaStreamDestination's stream
     * 2. Creates a JitsiLocalTrack via JitsiMeetJS.createLocalTracks()
     * 3. Adds the track to the room via room.addTrack()
     *
     * Must be called after initialize() and after the room is joined.
     */
    publishLocalTrack(): Promise<void>;
    /**
     * Plays TTS MP3 audio by passing a URL to the browser (Phase 5).
     *
     * Instead of base64-encoding the audio and sending it over CDP,
     * the audio is pre-stored in BotPageServer and the browser fetches
     * the binary MP3 directly via HTTP from localhost.
     */
    playMp3AudioFromUrl(audioUrl: string): Promise<void>;
    /**
     * Gets the playback health status from the browser (Phase 5).
     */
    getPlaybackHealth(): Promise<AudioHealth["playback"]>;
    /**
     * Reinitializes the audio infrastructure (called on heartbeat timeout).
     */
    reinitialize(): Promise<void>;
    /**
     * Gets the current health status.
     */
    getHealth(): Promise<AudioHealth>;
    /**
     * Cleans up audio resources.
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=AudioContextManager.d.ts.map