import { BaseAgent } from '../base-agent.js';

export class PlannerAgent extends BaseAgent {
  constructor(memoryManager) {
    super('planner', {
      role: 'Strategic planner and project architect',
      capabilities: [
        'Goal decomposition into milestones',
        'OKR and KPI framework design',
        'Roadmap and timeline planning',
        'Resource allocation',
        'Risk identification and mitigation',
        'Content calendar planning',
        'Decision framework creation',
      ],
    }, memoryManager);
  }
}
