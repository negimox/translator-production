/**
 * Port Allocator (Phase 7)
 *
 * Manages dynamic port allocation for translator agent child processes.
 * Each agent needs a unique botPagePort and healthPort.
 */
export declare class PortAllocator {
    private botPagePortBase;
    private healthPortBase;
    private allocatedBotPorts;
    private allocatedHealthPorts;
    constructor(botPagePortBase: number, healthPortBase: number);
    /**
     * Allocates a pair of ports (botPagePort, healthPort).
     * Finds the next available offset from each base.
     */
    allocate(): {
        botPagePort: number;
        healthPort: number;
    };
    /**
     * Releases a pair of ports back to the pool.
     */
    release(botPagePort: number, healthPort: number): void;
    /**
     * Finds the next available offset where both ports are free.
     */
    private findNextOffset;
    /**
     * Returns the number of currently allocated port pairs.
     */
    getAllocatedCount(): number;
}
//# sourceMappingURL=PortAllocator.d.ts.map