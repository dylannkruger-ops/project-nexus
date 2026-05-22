// Performance scorer — evaluates outputs using a critic agent
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

export class Scorer {
  async scoreOutput(taskInput, output, criteria = ['completeness', 'accuracy', 'quality', 'usefulness']) {
    try {
      const res = await client.messages.create({
        model: config.agents.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Score this agent output on a 0-10 scale across criteria: ${criteria.join(', ')}.

ORIGINAL TASK: ${taskInput}

AGENT OUTPUT: ${typeof output === 'string' ? output.slice(0, 2000) : JSON.stringify(output).slice(0, 2000)}

Respond with JSON only:
{
  "overallScore": 0-10,
  "breakdown": { "completeness": 0-10, "accuracy": 0-10, "quality": 0-10, "usefulness": 0-10 },
  "reasoning": "<1-2 sentences>"
}`,
          },
        ],
      });

      const jsonMatch = res.content[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('[SCORER]', e.message);
    }
    return { overallScore: 6, breakdown: {}, reasoning: 'fallback default' };
  }

  // Quick heuristic score for fast feedback
  heuristicScore(output) {
    if (!output) return 0;
    const text = typeof output === 'string' ? output : JSON.stringify(output);
    if (text.length < 50) return 3;
    if (text.length < 200) return 5;
    if (text.length < 1000) return 7;
    return 8;
  }
}
