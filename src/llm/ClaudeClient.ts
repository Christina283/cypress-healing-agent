import Anthropic from '@anthropic-ai/sdk';
import { AgentConfig, SelectorCandidate } from '../types';

export class ClaudeClient {
  private client: Anthropic;
  private model: string;

  constructor(config: AgentConfig) {
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey ?? process.env.ANTHROPIC_API_KEY,
    });
    this.model = config.model ?? 'claude-sonnet-4-20250514';
  }

  async generateSelectorCandidates(prompt: string): Promise<SelectorCandidate[]> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    const cleaned = raw.replace(/```json|```/g, '').trim();

    const parsed = JSON.parse(cleaned) as Array<{
      selector: string;
      confidence: number;
      reasoning: string;
    }>;

    return parsed.map(item => ({
      selector: item.selector,
      confidence: item.confidence,
      strategy: 'llm-claude' as const,
      reasoning: item.reasoning,
    }));
  }
}