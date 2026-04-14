"use strict";
/**
 * Health check types and functions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLivenessStatus = getLivenessStatus;
exports.getReadinessStatus = getReadinessStatus;
/**
 * Generates a liveness probe response.
 * Checks if the agent process is alive and Chrome is running.
 */
function getLivenessStatus(healthState) {
    return {
        healthy: healthState.chrome,
        ready: healthState.chrome,
    };
}
/**
 * Generates a readiness probe response.
 * Checks if the agent is ready to process audio.
 */
function getReadinessStatus(healthState) {
    const ready = healthState.chrome &&
        healthState.audioContext === "running" &&
        healthState.captureActive &&
        healthState.outputActive &&
        healthState.heartbeatHealthy &&
        healthState.meetingConnected &&
        (healthState.pipelineHealthy ?? true); // Phase 4: Include pipeline health
    return {
        healthy: ready,
        ready,
        details: healthState,
    };
}
//# sourceMappingURL=HealthChecks.js.map