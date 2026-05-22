import { BaseAgent } from '../base-agent.js';

export class MonitorAgent extends BaseAgent {
  constructor(memoryManager) {
    super('monitor', {
      role: 'System health monitor and alerting agent',
      capabilities: [
        'Agent pool utilization analysis',
        'Task failure pattern detection',
        'Performance degradation alerting',
        'Resource usage monitoring',
        'Uptime and reliability tracking',
        'Anomaly detection',
      ],
    }, memoryManager);
  }
}
