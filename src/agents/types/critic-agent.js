import { BaseAgent } from '../base-agent.js';

export class CriticAgent extends BaseAgent {
  constructor(memoryManager) {
    super('critic', {
      role: 'Quality assurance reviewer and critic',
      capabilities: [
        'Output quality scoring (0-10)',
        'Fact-checking and accuracy verification',
        'Logic and argument evaluation',
        'Completeness checking',
        'Specific improvement suggestions',
        'Bias and error detection',
        'Brand guideline compliance',
      ],
    }, memoryManager);
  }

  getSystemPrompt(task, contextPacket) {
    return `You are a critic agent in the KRONOS system. Your job is to review work from other agents and score it.

${contextPacket ? '## CONTEXT\n' + contextPacket + '\n' : ''}
Score on: completeness, accuracy, quality, usefulness, brand fit.

Respond in JSON:
{
  "result": "<your full review and feedback>",
  "summary": "<1-sentence verdict>",
  "score": <0-10>,
  "confidence": <0.0-1.0>,
  "issues": ["<issue 1>", "<issue 2>"],
  "improvements": ["<improvement 1>"],
  "thoughtProcess": "<your reasoning>",
  "tags": ["review"],
  "followupNeeded": <true if score < 6>
}`;
  }
}
