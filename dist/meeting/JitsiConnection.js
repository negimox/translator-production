"use strict";
/**
 * Jitsi Meeting Connection module.
 *
 * Simplified: navigates Puppeteer to the local bot page
 * and waits for the lib-jitsi-meet connection to establish.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitsiConnection = void 0;
const config_1 = require("../config");
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("JitsiConnection");
/**
 * Jitsi meeting connection manager.
 * Uses the local bot page which connects via lib-jitsi-meet.
 */
class JitsiConnection {
    config;
    page;
    connected = false;
    botPageUrl;
    constructor(config, page, botPageUrl) {
        this.config = config;
        this.page = page;
        this.botPageUrl = botPageUrl;
    }
    /**
     * Connects to the Jitsi meeting by navigating to the bot page.
     */
    async connect() {
        const displayName = (0, config_1.getDisplayName)(this.config);
        logger.info("Connecting to Jitsi meeting via bot page", {
            botPageUrl: this.botPageUrl,
            displayName,
        });
        // Navigate to the bot page
        // Use 'load' instead of 'networkidle0' because WebRTC traffic never goes idle
        await this.page.goto(this.botPageUrl, {
            waitUntil: "load",
            timeout: 30000,
        });
        logger.info("Bot page loaded, waiting for conference join");
        // Wait for the bot to load dependencies and connect
        await this.waitForConferenceJoined();
        this.connected = true;
        logger.info("Successfully connected to Jitsi meeting", { displayName });
    }
    /**
     * Waits for the conference to be joined.
     */
    async waitForConferenceJoined() {
        logger.debug("Waiting for conference to be joined");
        const maxWaitMs = 90000; // 90 seconds (config + lib load + connect)
        const checkIntervalMs = 1000;
        let elapsed = 0;
        while (elapsed < maxWaitMs) {
            const status = await this.page.evaluate(() => {
                return {
                    botLoaded: window.__botLoaded === true,
                    joined: window.__jitsiJoined === true,
                    error: window.__jitsiError,
                    participantId: window.__jitsiParticipantId,
                };
            });
            // Check for errors
            if (status.error) {
                logger.error("Jitsi connection error", { error: status.error });
                throw new Error(`Jitsi error: ${JSON.stringify(status.error)}`);
            }
            // Check if joined
            if (status.joined) {
                logger.info("Conference joined successfully", {
                    participantId: status.participantId,
                });
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, checkIntervalMs));
            elapsed += checkIntervalMs;
            // Log progress every 10 seconds
            if (elapsed % 10000 === 0) {
                logger.debug("Still waiting for conference join...", {
                    elapsedMs: elapsed,
                    botLoaded: status.botLoaded,
                });
            }
        }
        // Timeout - get final state for debugging
        const finalState = await this.page.evaluate(() => {
            return {
                botLoaded: window.__botLoaded,
                joined: window.__jitsiJoined,
                error: window.__jitsiError,
                statusText: document.getElementById("status")?.textContent,
            };
        });
        logger.error("Conference join timeout", { finalState });
        throw new Error(`Timeout waiting for conference to join. Status: ${finalState.statusText}`);
    }
    /**
     * Checks if connected to the meeting.
     */
    isConnected() {
        return this.connected;
    }
    /**
     * Disconnects from the meeting.
     * Awaits room.leave() to ensure XMPP presence "unavailable" stanza is sent
     * before closing the connection. Without this, Prosody must wait for its
     * session timeout (~60s) before considering the occupant as "left", causing
     * ghost participants to linger in the conference UI.
     */
    async disconnect() {
        if (!this.connected)
            return;
        logger.info("Disconnecting from meeting");
        const LEAVE_TIMEOUT_MS = 5000;
        try {
            await Promise.race([
                this.page.evaluate(async () => {
                    const room = window.room;
                    const connection = window.connection;
                    if (room) {
                        try {
                            await room.leave();
                        }
                        catch (e) {
                            console.warn("[Bot] room.leave() error:", e);
                        }
                    }
                    if (connection) {
                        connection.disconnect();
                    }
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Leave timeout")), LEAVE_TIMEOUT_MS)),
            ]);
        }
        catch (error) {
            logger.warn("Error during disconnect (will force close)", {
                error: String(error),
            });
        }
        this.connected = false;
        logger.info("Disconnected from meeting");
    }
}
exports.JitsiConnection = JitsiConnection;
//# sourceMappingURL=JitsiConnection.js.map