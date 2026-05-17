export interface BrokenSelectorContext {
    originalSelector: string;
    pageUrl: string;
    testTitle: string;
    domSnapshot: string;
    failureReason: string;
}
export interface SelectorCandidate {
    selector: string;
    confidence: number;
    strategy: HealingStrategy;
    reasoning: string;
}
export interface HealingResult {
    success: boolean;
    healedSelector: string | null;
    candidates: SelectorCandidate[];
    strategy: HealingStrategy;
    healedAt: string;
}
export interface RegistryEntry {
    originalSelector: string;
    healedSelector: string;
    confidence: number;
    strategy: HealingStrategy;
    healedAt: string;
    testTitle: string;
    pageUrl: string;
    usageCount: number;
}
export interface AgentConfig {
    anthropicApiKey?: string;
    model?: string;
    maxCandidates?: number;
    registryPath?: string;
    reportOutputPath?: string;
    domSnapshotMaxChars?: number;
    enableCache?: boolean;
    logLevel?: 'silent' | 'normal' | 'verbose';
}
export type HealingStrategy = 'llm-claude' | 'attribute-match' | 'fuzzy-text' | 'registry-cache';
//# sourceMappingURL=index.d.ts.map