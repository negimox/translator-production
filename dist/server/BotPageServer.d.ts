/**
 * Bot Page Server - serves the static bot HTML page.
 *
 * Puppeteer navigates to this local server to load the bot page
 * which then uses lib-jitsi-meet to connect to Jitsi.
 *
 * Phase 5: Also serves TTS audio buffers via /tts/:id endpoint,
 * allowing the browser to fetch binary audio directly instead of
 * receiving base64-encoded data over CDP.
 */
/**
 * Bot Page Server that serves static files for the translator bot.
 */
export declare class BotPageServer {
    private app;
    private server;
    private port;
    /** Phase 5: In-memory store for TTS audio buffers, keyed by chunk ID. */
    private ttsBuffers;
    constructor(port?: number);
    /**
     * Set up routes for serving static files.
     */
    private setupRoutes;
    /**
     * Phase 5: Stores TTS audio for the browser to fetch via /tts/:id.
     * Returns the localhost URL the browser should fetch.
     * Audio is automatically cleaned up after TTL if not fetched.
     */
    storeTtsAudio(id: string, buffer: Buffer): string;
    /**
     * Start the server.
     */
    start(): Promise<void>;
    /**
     * Stop the server.
     */
    stop(): Promise<void>;
    /**
     * Get the URL for the bot page with parameters.
     */
    getBotPageUrl(domain: string, roomName: string, displayName: string): string;
    /**
     * Get the server port.
     */
    getPort(): number;
}
//# sourceMappingURL=BotPageServer.d.ts.map