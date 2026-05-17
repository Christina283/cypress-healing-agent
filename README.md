# cypress-healing-agent

> AI-powered self-healing selector agent for Cypress, powered by Claude Sonnet.

When a Cypress selector fails, the agent captures a focused DOM snapshot,
reasons over it using Claude, and substitutes a working selector —
automatically, without touching your test code.

## How it works

1. `cy.getHealing()` checks if the selector exists in the DOM
2. On failure, captures a focused DOM snapshot (~6000 chars)
3. Sends snapshot + broken selector to Claude Sonnet with a structured prompt
4. Claude returns ranked selector candidates with confidence scores
5. Top candidate is validated in the live DOM and used for the test
6. Healed selector is persisted to `healing-registry.json` for cache reuse
7. After the run, a markdown report is written summarising all healed selectors

## Install

```bash
npm install git+https://github.com/Christina283/Cypress-Healing-Agent.git#v1.0.0
```

## Setup

### 1. Add your API key to `.env`

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 2. Wire the plugin in `cypress.config.ts`

```typescript
import { defineConfig } from 'cypress';
import { registerHealingPlugin } from 'cypress-healing-agent';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      registerHealingPlugin(on, config, {
        logLevel: 'verbose',
      });
    },
  },
});
```

### 3. Import the command in `cypress/support/e2e.ts`

```typescript
import 'cypress-healing-agent/cypress-support/command';
```

## Usage

```typescript
// Use cy.getHealing() instead of cy.get() for selectors that may break
cy.getHealing('#submit-btn').click();
cy.getHealing('[data-testid="login-btn"]').should('be.visible');
```

## Configuration

| Option | Default | Description |
|---|---|---|
| `model` | `claude-sonnet-4-20250514` | Claude model to use |
| `maxCandidates` | `5` | Max selectors Claude proposes |
| `registryPath` | `cypress/fixtures/healing-registry.json` | Per-project cache |
| `reportOutputPath` | `cypress/reports/healing-report.md` | Report location |
| `enableCache` | `true` | Skip LLM if selector was healed before |
| `logLevel` | `normal` | `silent`, `normal`, or `verbose` |

## Output

After each run, two outputs are generated inside your consuming project:

- `cypress/fixtures/healing-registry.json` — persisted healed selector map
- `cypress/reports/healing-report.md` — markdown report of all healed selectors

## Author

Christina Charles