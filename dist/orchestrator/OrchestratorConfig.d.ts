/**
 * Orchestrator configuration (Phase 7)
 * Separate from agent config - loaded from environment variables.
 */
export interface OrchestratorConfig {
    webhookPort: number;
    jitsiDomain: string;
    maxAgentsPerRoom: number;
    maxTotalAgents: number;
    spawnCooldownMs: number;
    terminationGraceMs: number;
    botPagePortBase: number;
    healthPortBase: number;
    healthCheckIntervalMs: number;
    healthCheckMaxFailures: number;
    maxRestartsPerWindow: number;
    restartWindowMs: number;
    globalTokenBucketCapacity: number;
    globalTokenBucketRefillRate: number;
    mizanBaseUrl: string;
    mizanUsername: string;
    mizanPassword: string;
    agentDisplayNamePrefix: string;
    sourceLanguage: string;
    ttsVoice: string;
    ttsSpeed: number;
    translationTemplatePattern: string;
    shutdownTimeoutMs: number;
    agentStartupTimeoutMs: number;
    webhookAuthToken: string;
    apiAuthToken: string;
    logLevel: "debug" | "info" | "warn" | "error";
}
export declare function loadOrchestratorConfig(): OrchestratorConfig;
//# sourceMappingURL=OrchestratorConfig.d.ts.map