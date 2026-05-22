// Prompt optimizer — evolves agent prompts based on what scores well
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

export class PromptOptimizer {
  constructor(memoryManager, tracker) {
    this.memory = memoryManager;
    this.tracker = tracker;
    this.optimizations = {};
  }

  // Analyze top vs bottom performers, suggest prompt improvements
  async optimize(agentType) {
    const outcomes = this.tracker.getByAgent(agentType, 100);
    if (outcomes.length < 20) return null;

    const sorted = [...outcomes].sort((a, b) => b.score - a.score);
    const top = sorted.slice(0, 5);
    const bottom = sorted.slice(-5);

    const res = await client.messages.create({
      model: config.agents.model,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Analyze these high vs low performing outputs from a "${agentType}" agent.

TOP PERFORMERS (high scores):
${top.map(t => `[${t.score}/10] ${t.output.slice(0, 200)}`).join('\n')}

LOW PERFORMERS:
${bottom.map(t => `[${t.score}/10] ${t.output.slice(0, 200)}`).join('\n')}

What patterns make outputs successful?
Suggest 3-5 specific additions to the system prompt that would improve future performance.
Respond as JSON:
{
  "patterns": ["<pattern>"],
  "promptAdditions": ["<concrete sentence to add to system prompt>"]
}`,
        },
      ],
    });

    const jsonMatch = res.content[0].text.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (result) {
      this.optimizations[agentType] = {
        ...result,
        timestamp: Date.now(),
        sampleSize: outcomes.length,
      };
    }

    return result;
  }

  getOptimization(agentType) {
    return this.optimizations[agentType] || null;
  }
}
