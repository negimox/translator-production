"use strict";
/**
 * Shared environment variable parsing utilities.
 * Used by both agent config (src/config.ts) and orchestrator config.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBoolEnv = parseBoolEnv;
exports.parseIntEnv = parseIntEnv;
exports.parseFloatEnv = parseFloatEnv;
exports.validateRequiredEnv = validateRequiredEnv;
function parseBoolEnv(value, defaultValue) {
    if (value === undefined)
        return defaultValue;
    return value.toLowerCase() === "true" || value === "1";
}
function parseIntEnv(value, defaultValue) {
    if (value === undefined)
        return defaultValue;
    const parsed = Number.parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
}
function parseFloatEnv(value, defaultValue) {
    if (value === undefined)
        return defaultValue;
    const parsed = Number.parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}
function validateRequiredEnv(name, value) {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
//# sourceMappingURL=envParsing.js.map