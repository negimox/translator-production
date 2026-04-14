/**
 * Health check types and functions.
 */
import { AgentState } from "../agent/TranslatorAgent";
/**
 * Detailed health status of the agent.
 */
export interface AgentHealthState {
    state: AgentState;
    healthy: boolean;
    chrome: boolean;
    audioContext: "suspended" | "running" | "closed";
    captureActive: boolean;
    outputActive: boolean;
    heartbeatHealthy: boolean;
    meetingConnected: boolean;
    pipelineHealthy?: boolean;
    uptime: number;
}
/**
 * Simple health status for probes.
 */
export interface HealthStatus {
    healthy: boolean;
    ready: boolean;
    details?: AgentHealthState;
}
/**
 * Generates a liveness probe response.
 * Checks if the agent process is alive and Chrome is running.
 */
export declare function getLivenessStatus(healthState: AgentHealthState): HealthStatus;
/**
 * Generates a readiness probe response.
 * Checks if the agent is ready to process audio.
 */
export declare function getReadinessStatus(healthState: AgentHealthState): HealthStatus;
//# sourceMappingURL=HealthChecks.d.ts.map