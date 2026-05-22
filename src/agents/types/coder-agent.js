import { BaseAgent } from '../base-agent.js';

export class CoderAgent extends BaseAgent {
  constructor(memoryManager) {
    super('coder', {
      role: 'Senior software engineer and architect',
      capabilities: [
        'Full-stack code generation (any language)',
        'Architecture and system design',
        'Bug diagnosis and debugging',
        'Code review and optimization',
        'API design and integration',
        'Test writing (unit, integration, e2e)',
        'Database schema design',
      ],
    }, memoryManager);
  }
}
