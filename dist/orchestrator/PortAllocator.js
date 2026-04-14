"use strict";
/**
 * Port Allocator (Phase 7)
 *
 * Manages dynamic port allocation for translator agent child processes.
 * Each agent needs a unique botPagePort and healthPort.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortAllocator = void 0;
const logger_1 = require("../logger");
const logger = (0, logger_1.createLogger)("PortAllocator");
class PortAllocator {
    botPagePortBase;
    healthPortBase;
    allocatedBotPorts = new Set();
    allocatedHealthPorts = new Set();
    constructor(botPagePortBase, healthPortBase) {
        this.botPagePortBase = botPagePortBase;
        this.healthPortBase = healthPortBase;
        logger.info("PortAllocator initialized", {
            botPagePortBase,
            healthPortBase,
        });
    }
    /**
     * Allocates a pair of ports (botPagePort, healthPort).
     * Finds the next available offset from each base.
     */
    allocate() {
        const offset = this.findNextOffset();
        const botPagePort = this.botPagePortBase + offset;
        const healthPort = this.healthPortBase + offset;
        this.allocatedBotPorts.add(botPagePort);
        this.allocatedHealthPorts.add(healthPort);
        logger.info("Ports allocated", { botPagePort, healthPort, offset });
        return { botPagePort, healthPort };
    }
    /**
     * Releases a pair of ports back to the pool.
     */
    release(botPagePort, healthPort) {
        this.allocatedBotPorts.delete(botPagePort);
        this.allocatedHealthPorts.delete(healthPort);
        logger.info("Ports released", { botPagePort, healthPort });
    }
    /**
     * Finds the next available offset where both ports are free.
     */
    findNextOffset() {
        for (let offset = 0; offset < 100; offset++) {
            const botPort = this.botPagePortBase + offset;
            const healthPort = this.healthPortBase + offset;
            if (!this.allocatedBotPorts.has(botPort) &&
                !this.allocatedHealthPorts.has(healthPort)) {
                return offset;
            }
        }
        throw new Error("No available ports - all 100 offsets exhausted");
    }
    /**
     * Returns the number of currently allocated port pairs.
     */
    getAllocatedCount() {
        return this.allocatedBotPorts.size;
    }
}
exports.PortAllocator = PortAllocator;
//# sourceMappingURL=PortAllocator.js.map