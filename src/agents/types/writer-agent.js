import { BaseAgent } from '../base-agent.js';

export class WriterAgent extends BaseAgent {
  constructor(memoryManager) {
    super('writer', {
      role: 'Expert writer and content creator',
      capabilities: [
        'Long-form articles and reports',
        'Marketing copy and ad creative',
        'Email sequences and outreach',
        'Executive summaries and briefs',
        'Social media content',
        'Technical documentation',
        'Scripts and storytelling',
      ],
    }, memoryManager);
  }
}
