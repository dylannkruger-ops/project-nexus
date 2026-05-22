import { BaseAgent } from '../base-agent.js';

export class LearnerAgent extends BaseAgent {
  constructor(memoryManager) {
    super('learner', {
      role: 'Knowledge extractor and learning specialist',
      capabilities: [
        'Distilling lessons from outcomes',
        'Pattern recognition across tasks',
        'Creating reusable procedures',
        'Knowledge base updates',
        'Anti-pattern identification',
        'Performance improvement recommendations',
      ],
    }, memoryManager);
  }
}
