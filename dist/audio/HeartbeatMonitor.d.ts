/**
 * Heartbeat Monitor for AudioWorklet health.
 *
 * Watches for periodic heartbeat messages from the AudioWorklet processor.
 * If heartbeats stop, triggers reinitialization of the audio infrastructure.
 */
import { Page } from 'puppeteer';
import { AgentConfig } from '../config';
/**
 * Heartbeat Monitor class.
 * Monitors worklet health via periodic heartbeat messages.
 */
export declare class HeartbeatMonitor {
    private config;
    private page;
    private onTimeout;
    private checkIntervalId;
    private lastHeartbeatTime;
    private isRunning;
    private missedCount;
    private readonly maxMissedBeforeTimeout;
    constructor(config: AgentConfig, page: Page, onTimeout: () => void);
    /**
     * Starts monitoring for heartbeats.
     */
    start(): Promise<void>;
    /**
     * Checks for recent heartbeat.
     */
    private checkHeartbeat;
    /**
     * Stops the heartbeat monitor.
     */
    stop(): void;
    /**
     * Checks if heartbeats are currently healthy.
     */
    isHealthy(): boolean;
    /**
     * Gets the time since the last heartbeat.
     */
    getTimeSinceLastHeartbeat(): number;
}
//# sourceMappingURL=HeartbeatMonitor.d.ts.map