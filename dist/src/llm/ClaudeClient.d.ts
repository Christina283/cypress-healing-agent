import { AgentConfig, SelectorCandidate } from '../types';
export declare class ClaudeClient {
    private client;
    private model;
    constructor(config: AgentConfig);
    generateSelectorCandidates(prompt: string): Promise<SelectorCandidate[]>;
}
//# sourceMappingURL=ClaudeClient.d.ts.map