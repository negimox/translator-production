/**
 * Jitsi Meeting Connection module.
 *
 * Simplified: navigates Puppeteer to the local bot page
 * and waits for the lib-jitsi-meet connection to establish.
 */
import { Page } from "puppeteer";
import { AgentConfig } from "../config";
/**
 * Jitsi meeting connection manager.
 * Uses the local bot page which connects via lib-jitsi-meet.
 */
export declare class JitsiConnection {
    private config;
    private page;
    private connected;
    private botPageUrl;
    constructor(config: AgentConfig, page: Page, botPageUrl: string);
    /**
     * Connects to the Jitsi meeting by navigating to the bot page.
     */
    connect(): Promise<void>;
    /**
     * Waits for the conference to be joined.
     */
    private waitForConferenceJoined;
    /**
     * Checks if connected to the meeting.
     */
    isConnected(): boolean;
    /**
     * Disconnects from the meeting.
     * Awaits room.leave() to ensure XMPP presence "unavailable" stanza is sent
     * before closing the connection. Without this, Prosody must wait for its
     * session timeout (~60s) before considering the occupant as "left", causing
     * ghost participants to linger in the conference UI.
     */
    disconnect(): Promise<void>;
}
//# sourceMappingURL=JitsiConnection.d.ts.map