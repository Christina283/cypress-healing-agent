"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeClient = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class ClaudeClient {
    constructor(config) {
        this.client = new sdk_1.default({
            apiKey: config.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY,
        });
        this.model = config.model ?? 'claude-sonnet-4-20250514';
    }
    async generateSelectorCandidates(prompt) {
        const response = await this.client.messages.create({
            model: this.model,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
        });
        const raw = response.content
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('');
        const cleaned = raw.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return parsed.map(item => ({
            selector: item.selector,
            confidence: item.confidence,
            strategy: 'llm-claude',
            reasoning: item.reasoning,
        }));
    }
}
exports.ClaudeClient = ClaudeClient;
//# sourceMappingURL=ClaudeClient.js.map