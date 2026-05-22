// Outcome tracker — records every task result for learning
export class OutcomeTracker {
  constructor(memoryManager) {
    this.memory = memoryManager;
    this.outcomes = [];
  }

  async track(taskId, agentType, taskType, input, output, score, durationMs) {
    const record = {
      taskId,
      agentType,
      taskType,
      input: input.slice(0, 200),
      output: typeof output === 'string' ? output.slice(0, 500) : JSON.stringify(output).slice(0, 500),
      score,
      durationMs,
      timestamp: Date.now(),
    };
    this.outcomes.push(record);
    if (this.outcomes.length > 1000) this.outcomes.shift();

    try {
      await this.memory.pg.updateOutcome(taskId, output, score, durationMs);
    } catch (e) {
      console.warn('[TRACKER] DB update failed:', e.message);
    }
    return record;
  }

  getRecent(limit = 50) {
    return this.outcomes.slice(-limit).reverse();
  }

  getByAgent(agentType, limit = 50) {
    return this.outcomes.filter(o => o.agentType === agentType).slice(-limit).reverse();
  }

  computeAverageScore(agentType = null) {
    const filtered = agentType ? this.outcomes.filter(o => o.agentType === agentType) : this.outcomes;
    if (filtered.length === 0) return 0;
    return filtered.reduce((s, o) => s + o.score, 0) / filtered.length;
  }
}
