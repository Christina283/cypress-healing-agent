import { AgentConfig, RegistryEntry } from '../types';
export declare class HealingRegistry {
    private entries;
    private registryPath;
    private reportOutputPath;
    constructor(config: AgentConfig);
    private load;
    lookup(originalSelector: string, pageUrl: string): RegistryEntry | null;
    save(entry: RegistryEntry): void;
    incrementUsage(originalSelector: string, pageUrl: string): void;
    getAllEntries(): RegistryEntry[];
    generateReport(): string;
    writeReport(outputPath?: string): void;
    printSummary(): void;
}
//# sourceMappingURL=HealingRegistry.d.ts.map