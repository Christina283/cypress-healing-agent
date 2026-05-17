"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealingPlugin = registerHealingPlugin;
const HealingAgent_1 = require("../src/agent/HealingAgent");
const HealingRegistry_1 = require("../src/reporting/HealingRegistry");
function registerHealingPlugin(on, config, agentConfig = {}) {
    // Merge consumer config with defaults, using Cypress's projectRoot
    // so registry + report land inside the consuming project, not the package
    const resolvedConfig = {
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
    const registry = new HealingRegistry_1.HealingRegistry(resolvedConfig);
    const agent = new HealingAgent_1.HealingAgent(resolvedConfig, registry);
    // Wire the heal task — called by cy.getHealing() in the browser
    on('task', {
        async healSelector(context) {
            return await agent.heal(context);
        },
    });
    // Write markdown report + print console summary after all specs finish
    on('after:run', async () => {
        registry.printSummary();
        registry.writeReport(resolvedConfig.reportOutputPath);
    });
}
//# sourceMappingURL=plugin.js.map