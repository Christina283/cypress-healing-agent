import { Agent } from 'node:http';
import { HealingAgent } from '../src/agent/HealingAgent';
import { HealingRegistry } from '../src/reporting/HealingRegistry';
import { AgentConfig, BrokenSelectorContext } from '../src/types';

export function registerHealingPlugin(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  agentConfig: AgentConfig = {}
): void {

  // Merge consumer config with defaults, using Cypress's projectRoot
  // so registry + report land inside the consuming project, not the package
  const resolvedConfig: AgentConfig = {
    anthropicApiKey: agentConfig.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY,
    model: agentConfig.model ?? 'claude-sonnet-4-20250514',
    maxCandidates: agentConfig.maxCandidates ?? 5,
    registryPath: agentConfig.registryPath ??
      `${config.projectRoot}/cypress/fixtures/healing-registry.json`,
    reportOutputPath: agentConfig.reportOutputPath ??
      `${config.projectRoot}/cypress/reports/healing-report.md`,
    domSnapshotMaxChars: agentConfig.domSnapshotMaxChars ?? 6000,
    enableCache: agentConfig.enableCache ?? true,
    logLevel: agentConfig.logLevel ?? 'normal',
  };

  const registry = new HealingRegistry(resolvedConfig);
  const agent = new HealingAgent(resolvedConfig, registry);

  // Wire the heal task — called by cy.getHealing() in the browser
  on('task', {
    async healSelector(context: BrokenSelectorContext) {
      return await agent.heal(context);
    },
  });

  // Write markdown report + print console summary after all specs finish
  on('after:run', async () => {
    registry.printSummary();
    registry.writeReport(resolvedConfig.reportOutputPath);
  });
}