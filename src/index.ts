// src/index.ts — the ONLY file consumers touch

export { HealingAgent } from './agent/HealingAgent';
export { HealingRegistry } from './reporting/HealingRegistry';
export type {
  BrokenSelectorContext,
  HealingResult,
  SelectorCandidate,
  RegistryEntry,
  HealingStrategy,
  AgentConfig,           // ← new: per-project config
} from './types';

// Convenience re-export for cypress.config.ts wiring
export { registerHealingPlugin } from '../cypress-support/plugin';