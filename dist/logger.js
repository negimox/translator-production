"use strict";
/**
 * Simple logger utility for the translator agent.
 * Supports log levels and structured output.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createLogger = createLogger;
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
/**
 * Logger class with level-based filtering and structured output.
 */
class Logger {
    minLevel;
    component;
    constructor(component = 'Agent') {
        this.component = component;
        // Get log level from environment, default to 'info'
        const logLevel = process.env.LOG_LEVEL || 'info';
        this.minLevel = LOG_LEVELS[logLevel] ?? LOG_LEVELS.info;
    }
    /**
     * Creates a child logger with a specific component name.
     */
    child(component) {
        return new Logger(component);
    }
    /**
     * Updates the minimum log level.
     */
    setLevel(level) {
        this.minLevel = LOG_LEVELS[level];
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${this.component}] ${message}${dataStr}`;
    }
    log(level, message, data) {
        if (LOG_LEVELS[level] >= this.minLevel) {
            const formatted = this.formatMessage(level, message, data);
            switch (level) {
                case 'error':
                    console.error(formatted);
                    break;
                case 'warn':
                    console.warn(formatted);
                    break;
                default:
                    console.log(formatted);
            }
        }
    }
    debug(message, data) {
        this.log('debug', message, data);
    }
    info(message, data) {
        this.log('info', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    error(message, data) {
        this.log('error', message, data);
    }
}
// Default logger instance
exports.logger = new Logger();
// Factory function for component-specific loggers
function createLogger(component) {
    return new Logger(component);
}
//# sourceMappingURL=logger.js.map