"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilder = void 0;
class PromptBuilder {
    static buildHealingPrompt(context) {
        return `
You are a test automation expert specializing in CSS selector repair.

A Cypress end-to-end test has FAILED because this selector no longer finds its element:
BROKEN SELECTOR: "${context.originalSelector}"
FAILURE REASON: ${context.failureReason}
PAGE URL: ${context.pageUrl}

Your task: Analyze the DOM snapshot below and suggest up to 5 alternative selectors 
that likely refer to the SAME element the original selector was targeting.

PRIORITIZATION RULES (follow in order):
1. Prefer data-testid, data-cy, data-qa attributes — they are test-stable
2. Prefer aria-label, role attributes — semantically meaningful
3. Prefer unique text content with :contains() or accessible name
4. Avoid positional selectors like :nth-child() — they are fragile
5. Avoid generic classes like .btn or .container without further specificity

DOM SNAPSHOT:
\`\`\`html
${context.domSnapshot}
\`\`\`

Respond ONLY with a JSON array. No explanation outside the JSON.
Each item must have:
- "selector": string (the CSS/attribute selector)
- "confidence": number between 0 and 1
- "reasoning": string (one sentence why this selector matches the original intent)

Example format:
[
  {
    "selector": "[data-testid='submit-button']",
    "confidence": 0.95,
    "reasoning": "data-testid attribute explicitly identifies this as the submit action target"
  }
]
`.trim();
    }
}
exports.PromptBuilder = PromptBuilder;
//# sourceMappingURL=PromptBuilder.js.map