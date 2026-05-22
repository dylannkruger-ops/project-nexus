import pLimit from 'p-limit';
import { ResearchAgent } from './types/research-agent.js';
import { WriterAgent } from './types/writer-agent.js';
import { CoderAgent } from './types/coder-agent.js';
import { AnalystAgent } from './types/analyst-agent.js';
import { PlannerAgent } from './types/planner-agent.js';
import { OpsAgent } from './types/ops-agent.js';
import { CriticAgent } from './types/critic-agent.js';
import { LearnerAgent } from './types/learner-agent.js';
import { MonitorAgent } from './types/monitor-agent.js';
import { SynthAgent } from './types/synth-agent.js';
import { ContentAgent } from './types/content-agent.js';
import { PublisherAgent } from './types/publisher-agent.js';
import { config } from '../config.js';

const POOL_CONFIG = {
  research:  { Class: ResearchAgent,  count: 16 },
  writer:    { Class: WriterAgent,    count: 18 },
  coder:     { Class: CoderAgent,     count: 12 },
  analyst:   { Class: AnalystAgent,   count: 12 },
  planner:   { Class: PlannerAgent,   count: 6  },
  ops:       { Class: OpsAgent,       count: 6  },
  critic:    { Class: CriticAgent,    count: 6  },
  learner:   { Class: LearnerAgent,   count: 4  },
  monitor:   { Class: MonitorAgent,   count: 2  },
  synth:     { Class: SynthAgent,     count: 2  },
  content:   { Class: ContentAgent,   count: 8  },
  publisher: { Class: PublisherAgent, count: 8  },
  // TOTAL: 100 agents
};

export class AgentPool {
  constructor(memoryManager) {
    this.memory = memoryManager;
    this.pools = {};
    this.limiter = pLimit(config.agents.maxConcurrent);
    this._initPools();
  }

  _initPools() {
    let total = 0;
    for (const [type, { Class, count }] of Object.entries(POOL_CONFIG)) {
      this.pools[type] = Array.from({ length: count }, () => new Class(this.memory));
      total += count;
    }
    console.log(`[POOL] Initialized ${total} agents across ${Object.keys(POOL_CONFIG).length} types`);
  }

  _getAvailableAgent(type) {
    const pool = this.pools[type];
    if (!pool) throw new Error(`Unknown agent type: ${type}`);
    const agent = pool.find(a => !a.busy);
    if (!agent) {
      // All busy — wait then retry once
      throw new Error(`All ${type} agents busy (pool: ${pool.length})`);
    }
    return agent;
  }

  async runWithAgent(type, taskInput, taskId, taskType) {
    return this.limiter(async () => {
      // Try up to 3 times if pool is saturated
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const agent = this._getAvailableAgent(type);
          return await agent.run(taskInput, taskId, taskType);
        } catch (err) {
          if (err.message.includes('busy') && attempt < 2) {
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
          throw err;
        }
      }
    });
  }

  getStatus() {
    const status = {};
    for (const [type, pool] of Object.entries(this.pools)) {
      status[type] = {
        total: pool.length,
        busy: pool.filter(a => a.busy).length,
        idle: pool.filter(a => !a.busy).length,
        taskCount: pool.reduce((s, a) => s + a.taskCount, 0),
      };
    }
    return status;
  }

  getTotalAgents() {
    return Object.values(this.pools).reduce((s, p) => s + p.length, 0);
  }
}
