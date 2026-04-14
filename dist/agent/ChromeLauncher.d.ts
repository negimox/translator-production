/**
 * Chrome Launcher module for Puppeteer with required flags.
 * Sets up headless Chrome with autoplay and media permissions enabled.
 */
import { Browser, Page } from "puppeteer";
import { AgentConfig } from "../config";
/**
 * Required Chrome flags for the translator agent.
 * These are critical for proper WebRTC and audio operation.
 */
export declare const REQUIRED_CHROME_FLAGS: string[];
/**
 * Permissions to grant to the page.
 */
export declare const REQUIRED_PERMISSIONS: readonly ["microphone", "camera", "notifications"];
/**
 * Result of launching Chrome.
 */
export interface ChromeInstance {
    browser: Browser;
    page: Page;
    close: () => Promise<void>;
}
/**
 * Launches a Puppeteer-controlled Chrome instance with the required flags.
 *
 * @param config - Agent configuration
 * @returns ChromeInstance with browser, page, and cleanup function
 */
export declare function launchChrome(config: AgentConfig): Promise<ChromeInstance>;
/**
 * Checks if the Chrome instance is still running.
 */
export declare function isChromeLive(instance: ChromeInstance): boolean;
//# sourceMappingURL=ChromeLauncher.d.ts.map