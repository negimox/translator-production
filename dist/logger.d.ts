/**
 * Simple logger utility for the translator agent.
 * Supports log levels and structured output.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
/**
 * Logger class with level-based filtering and structured output.
 */
declare class Logger {
    private minLevel;
    private component;
    constructor(component?: string);
    /**
     * Creates a child logger with a specific component name.
     */
    child(component: string): Logger;
    /**
     * Updates the minimum log level.
     */
    setLevel(level: LogLevel): void;
    private formatMessage;
    private log;
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, data?: Record<string, unknown>): void;
}
export declare const logger: Logger;
export declare function createLogger(component: string): Logger;
export {};
//# sourceMappingURL=logger.d.ts.map