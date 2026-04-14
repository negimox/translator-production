"use strict";
/**
 * Chrome Launcher module for Puppeteer with required flags.
 * Sets up headless Chrome with autoplay and media permissions enabled.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_PERMISSIONS = exports.REQUIRED_CHROME_FLAGS = void 0;
exports.launchChrome = launchChrome;
exports.isChromeLive = isChromeLive;
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("ChromeLauncher");
/**
 * Required Chrome flags for the translator agent.
 * These are critical for proper WebRTC and audio operation.
 */
exports.REQUIRED_CHROME_FLAGS = [
    // Critical: Enable autoplay without user gesture (required for AudioContext)
    "--autoplay-policy=no-user-gesture-required",
    // Auto-allow getUserMedia in headless mode (required for media access)
    "--use-fake-ui-for-media-stream",
    // Create fake audio/video devices (critical for headless bots)
    "--use-fake-device-for-media-stream",
    // Disable GPU for headless stability
    "--disable-gpu",
    // Required in containerized environments (Docker, K8s)
    "--no-sandbox",
    "--disable-setuid-sandbox",
    // Reduce resource usage
    "--disable-dev-shm-usage",
    // Disable unnecessary features for a bot
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-default-apps",
    "--disable-sync",
    "--disable-translate",
    // Audio-specific optimizations
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    // WebRTC-specific
    "--disable-features=WebRtcHideLocalIpsWithMdns",
    // CRITICAL: Enable audio output in headless Chrome
    // Without this, remote WebRTC audio won't be decoded/rendered
    "--enable-features=AudioServiceOutOfProcess",
    "--disable-features=AudioServiceSandbox",
];
/**
 * Permissions to grant to the page.
 */
exports.REQUIRED_PERMISSIONS = [
    "microphone",
    "camera",
    "notifications",
];
/**
 * Launches a Puppeteer-controlled Chrome instance with the required flags.
 *
 * @param config - Agent configuration
 * @returns ChromeInstance with browser, page, and cleanup function
 */
async function launchChrome(config) {
    logger.info("Launching Chrome with required flags", {
        headless: config.chromeHeadless,
        devtools: config.chromeDevtools,
    });
    const launchOptions = {
        headless: config.chromeHeadless ? "shell" : false,
        devtools: config.chromeDevtools,
        args: exports.REQUIRED_CHROME_FLAGS,
        // Ignore HTTPS errors (useful for self-signed certs in dev)
        ignoreHTTPSErrors: true,
        // Default viewport for the agent
        defaultViewport: {
            width: 1280,
            height: 720,
        },
    };
    logger.debug("Launch options configured", {
        flags: exports.REQUIRED_CHROME_FLAGS.slice(0, 5),
        flagCount: exports.REQUIRED_CHROME_FLAGS.length,
    });
    const browser = await puppeteer_1.default.launch(launchOptions);
    logger.info("Chrome browser launched successfully");
    // Get or create the first page
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();
    // Grant permissions for the Jitsi domain
    const jitsiOrigin = `https://${config.jitsiDomain}`;
    try {
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(jitsiOrigin, [...exports.REQUIRED_PERMISSIONS]);
        logger.info("Permissions granted for Jitsi domain", {
            origin: jitsiOrigin,
        });
    }
    catch (error) {
        logger.warn("Failed to override permissions (may not be critical)", {
            error: String(error),
        });
    }
    // Set up console message forwarding
    page.on("console", (msg) => {
        const type = msg.type();
        const text = msg.text();
        // Only log non-trivial messages
        if (text && !text.includes("[object Object]")) {
            switch (type) {
                case "error":
                    logger.error(`[Browser] ${text}`);
                    break;
                case "warn":
                    logger.warn(`[Browser] ${text}`);
                    break;
                case "info":
                case "log":
                    logger.debug(`[Browser] ${text}`);
                    break;
            }
        }
    });
    // Handle page errors
    page.on("pageerror", (error) => {
        logger.error("Page error occurred", { error: error.message });
    });
    // Handle request failures (useful for debugging)
    page.on("requestfailed", (request) => {
        const url = request.url();
        // Only log significant failures (skip tracking/analytics)
        if (!url.includes("analytics") && !url.includes("tracking")) {
            logger.debug("Request failed", {
                url: url.slice(0, 100),
                reason: request.failure()?.errorText,
            });
        }
    });
    const close = async () => {
        logger.info("Closing Chrome browser");
        try {
            await browser.close();
            logger.info("Chrome browser closed successfully");
        }
        catch (error) {
            logger.error("Error closing browser", { error: String(error) });
        }
    };
    return { browser, page, close };
}
/**
 * Checks if the Chrome instance is still running.
 */
function isChromeLive(instance) {
    try {
        return instance.browser.connected;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=ChromeLauncher.js.map