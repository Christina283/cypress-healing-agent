import { AgentConfig, BrokenSelectorContext, HealingResult, HealingStrategy, SelectorCandidate } from '../types';
import { ClaudeClient } from '../llm/ClaudeClient';
import { PromptBuilder } from './PromptBuilder';
import { DOMAnalyzer } from './DOMAnalyzer';
import { HealingRegistry } from '../reporting/HealingRegistry';

export class HealingAgent {
  private claudeClient: ClaudeClient;
  private registry: HealingRegistry;
  private config: AgentConfig;

  constructor(config: AgentConfig, registry: HealingRegistry) {
    this.config = config;
    this.registry = registry;
    this.claudeClient = new ClaudeClient(config);
  }

  async heal(context: BrokenSelectorContext): Promise<HealingResult> {
    this.log('normal', `\n🔧 [HealingAgent] Attempting to heal: "${context.originalSelector}"`);

    // ── STEP 1: OBSERVE — check registry cache first ─────────────────
    if (this.config.enableCache !== false) {
      const cached = this.registry.lookup(context.originalSelector, context.pageUrl);
      if (cached) {
        this.log('normal', `✅ [HealingAgent] Cache hit → "${cached.healedSelector}"`);
        this.registry.incrementUsage(context.originalSelector, context.pageUrl);
        return {
          success: true,
          healedSelector: cached.healedSelector,
          candidates: [],
          strategy: 'registry-cache',
          healedAt: new Date().toISOString(),
        };
      }
    }

    // ── STEP 2: REASON — ask Claude for candidates ───────────────────
    let candidates: SelectorCandidate[] = [];
    try {
      const focusedSnapshot = DOMAnalyzer.extractRelevantSubtree(
        context.domSnapshot,
        context.originalSelector,
        this.config.domSnapshotMaxChars
      );

      const prompt = PromptBuilder.buildHealingPrompt({
        ...context,
        domSnapshot: focusedSnapshot,
      });

      candidates = await this.claudeClient.generateSelectorCandidates(prompt);
      this.log('normal', `🤖 [HealingAgent] Claude returned ${candidates.length} candidates`);
      this.log('verbose', JSON.stringify(candidates, null, 2));
    } catch (err) {
      this.log('normal', `[HealingAgent] Claude call failed, using heuristic fallback`);
      candidates = this.heuristicFallback(context);
    }

    // ── STEP 3: ACT — sort by confidence, pick winner ────────────────
    candidates.sort((a, b) => b.confidence - a.confidence);

    // Cap to maxCandidates
    candidates = candidates.slice(0, this.config.maxCandidates ?? 5);

    const winner = candidates[0] ?? null;

    if (!winner) {
      this.log('normal', `[HealingAgent] No candidates generated. Healing failed.`);
      return {
        success: false,
        healedSelector: null,
        candidates,
        strategy: 'llm-claude',
        healedAt: new Date().toISOString(),
      };
    }

    // ── STEP 4: PERSIST ──────────────────────────────────────────────
    this.registry.save({
      originalSelector: context.originalSelector,
      healedSelector: winner.selector,
      confidence: winner.confidence,
      strategy: winner.strategy,
      healedAt: new Date().toISOString(),
      testTitle: context.testTitle,
      pageUrl: context.pageUrl,
      usageCount: 1,
    });

    this.log('normal', `✅ [HealingAgent] Healed → "${winner.selector}" (confidence: ${winner.confidence})`);

    return {
      success: true,
      healedSelector: winner.selector,
      candidates,
      strategy: winner.strategy,
      healedAt: new Date().toISOString(),
    };
  }

  private heuristicFallback(context: BrokenSelectorContext): SelectorCandidate[] {
    const hints = context.originalSelector
      .replace(/[#.\[\]'"=]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return hints.map(hint => ({
      selector: `[data-testid*="${hint}"]`,
      confidence: 0.4,
      strategy: 'attribute-match' as HealingStrategy,
      reasoning: `Heuristic: fuzzy data-testid match on "${hint}"`,
    }));
  }

  private log(level: 'normal' | 'verbose', message: string): void {
    if (this.config.logLevel === 'silent') return;
    if (level === 'verbose' && this.config.logLevel !== 'verbose') return;
    console.log(message);
  }
}