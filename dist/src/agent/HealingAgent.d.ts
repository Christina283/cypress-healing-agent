import { AgentConfig, BrokenSelectorContext, HealingResult } from '../types';
import { HealingRegistry } from '../reporting/HealingRegistry';
export declare class HealingAgent {
    private claudeClient;
    private registry;
    private config;
    constructor(config: AgentConfig, registry: HealingRegistry);
    heal(context: BrokenSelectorContext): Promise<HealingResult>;
    private heuristicFallback;
    private log;
}
//# sourceMappingURL=HealingAgent.d.ts.map