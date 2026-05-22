import { BaseAgent } from '../base-agent.js';

export class OpsAgent extends BaseAgent {
  constructor(memoryManager) {
    super('ops', {
      role: 'Operations specialist and automation engineer',
      capabilities: [
        'Workflow design and automation',
        'API integration planning',
        'Process documentation and SOPs',
        'System integration architecture',
        'Operational efficiency analysis',
        'Tool chain optimization',
      ],
    }, memoryManager);
  }
}
