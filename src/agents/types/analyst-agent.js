import { BaseAgent } from '../base-agent.js';

export class AnalystAgent extends BaseAgent {
  constructor(memoryManager) {
    super('analyst', {
      role: 'Data scientist and business analyst',
      capabilities: [
        'Data analysis and statistical reasoning',
        'Financial modeling and projections',
        'KPI dashboards and metric design',
        'Business intelligence reporting',
        'ROI and cost-benefit analysis',
        'Trend identification and forecasting',
        'Engagement and conversion analytics',
      ],
    }, memoryManager);
  }
}
