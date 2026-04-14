/**
 * Shared environment variable parsing utilities.
 * Used by both agent config (src/config.ts) and orchestrator config.
 */
export declare function parseBoolEnv(value: string | undefined, defaultValue: boolean): boolean;
export declare function parseIntEnv(value: string | undefined, defaultValue: number): number;
export declare function parseFloatEnv(value: string | undefined, defaultValue: number): number;
export declare function validateRequiredEnv(name: string, value: string | undefined): string;
//# sourceMappingURL=envParsing.d.ts.map