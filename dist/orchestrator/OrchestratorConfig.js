"use strict";
/**
 * Orchestrator configuration (Phase 7)
 * Separate from agent config - loaded from environment variables.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOrchestratorConfig = loadOrchestratorConfig;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const envParsing_1 = require("../utils/envParsing");
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
function loadOrchestratorConfig() {
    return {
        webhookPort: (0, envParsing_1.parseIntEnv)(process.env.ORCHESTRATOR_PORT, 4000),
        jitsiDomain: process.env.JITSI_DOMAIN || "meet.zaryans.net",
        maxAgentsPerRoom: (0, envParsing_1.parseIntEnv)(process.env.MAX_AGENTS_PER_ROOM, 4),
        maxTotalAgents: (0, envParsing_1.parseIntEnv)(process.env.MAX_TOTAL_AGENTS, 20),
        spawnCooldownMs: (0, envParsing_1.parseIntEnv)(process.env.SPAWN_COOLDOWN_MS, 3000),
        terminationGraceMs: (0, envParsing_1.parseIntEnv)(process.env.TERMINATION_GRACE_MS, 60000),
        botPagePortBase: (0, envParsing_1.parseIntEnv)(process.env.BOT_PAGE_PORT_BASE, 3010),
        healthPortBase: (0, envParsing_1.parseIntEnv)(process.env.HEALTH_PORT_BASE, 8090),
        healthCheckIntervalMs: (0, envParsing_1.parseIntEnv)(process.env.HEALTH_CHECK_INTERVAL_MS, 10000),
        healthCheckMaxFailures: (0, envParsing_1.parseIntEnv)(process.env.HEALTH_CHECK_MAX_FAILURES, 3),
        maxRestartsPerWindow: (0, envParsing_1.parseIntEnv)(process.env.MAX_RESTARTS_PER_WINDOW, 3),
        restartWindowMs: (0, envParsing_1.parseIntEnv)(process.env.RESTART_WINDOW_MS, 600000),
        // Global token bucket shared across all agents
        // Each agent needs 3 tokens for FULL_PIPELINE (STT + Translation + TTS)
        // Default capacity of 12 supports up to 4 concurrent agents (12/4 = 3 tokens each)
        globalTokenBucketCapacity: (0, envParsing_1.parseIntEnv)(process.env.GLOBAL_TOKEN_BUCKET_CAPACITY, 12),
        globalTokenBucketRefillRate: (0, envParsing_1.parseIntEnv)(process.env.GLOBAL_TOKEN_BUCKET_REFILL_RATE, 12),
        mizanBaseUrl: process.env.MIZAN_BASE_URL || "https://platform.mizanlabs.com/api/v1",
        mizanUsername: process.env.MIZAN_USERNAME || "",
        mizanPassword: process.env.MIZAN_PASSWORD || "",
        agentDisplayNamePrefix: process.env.AGENT_DISPLAY_NAME_PREFIX || "translator-",
        sourceLanguage: process.env.SOURCE_LANGUAGE || "en",
        ttsVoice: process.env.TTS_VOICE || "af_heart",
        ttsSpeed: (0, envParsing_1.parseFloatEnv)(process.env.TTS_SPEED, 1.0),
        translationTemplatePattern: process.env.TRANSLATION_TEMPLATE_PATTERN || "translator_{target}",
        shutdownTimeoutMs: (0, envParsing_1.parseIntEnv)(process.env.SHUTDOWN_TIMEOUT_MS, 30000),
        agentStartupTimeoutMs: (0, envParsing_1.parseIntEnv)(process.env.AGENT_STARTUP_TIMEOUT_MS, 120000),
        webhookAuthToken: process.env.WEBHOOK_AUTH_TOKEN || "",
        apiAuthToken: process.env.API_AUTH_TOKEN || "",
        logLevel: process.env.LOG_LEVEL || "info",
    };
}
//# sourceMappingURL=OrchestratorConfig.js.map