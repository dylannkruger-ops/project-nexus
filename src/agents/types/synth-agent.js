import { BaseAgent } from '../base-agent.js';

export class SynthAgent extends BaseAgent {
  constructor(memoryManager) {
    super('synth', {
      role: 'Synthesis and combination specialist',
      capabilities: [
        'Combining outputs from multiple agents',
        'Conflict resolution between perspectives',
        'Executive summary creation',
        'Multi-source synthesis',
        'Final output formatting',
        'Consensus identification',
      ],
    }, memoryManager);
  }
}
