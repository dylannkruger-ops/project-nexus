import { v4 as uuidv4 } from 'uuid';
import { RedisCache } from './redis-cache.js';
import { PineconeStore } from './pinecone-store.js';
import { PgStore } from './pg-store.js';

export class MemoryManager {
  constructor() {
    this.redis = new RedisCache();
    this.pinecone = new PineconeStore();
    this.pg = new PgStore();
  }

  async init() {
    await Promise.all([this.pinecone.init(), this.pg.init()]);
    console.log('[MEMORY] All three layers initialized');
  }

  async remember(text, metadata = {}) {
    const id = uuidv4();
    try {
      await this.redis.set(`memory:${id}`, { text, ...metadata }, 3600);
      await this.pinecone.store(id, text, metadata);
      if (metadata.category) {
        await this.pg.storeKnowledge(text, metadata.category, metadata.tags || [], metadata.taskId);
      }
    } catch (err) {
      console.error('[MEMORY] Remember failed:', err.message);
    }
    return id;
  }

  async recall(query, options = {}) {
    const { topK = 8, agentType, taskType } = options;
    const filter = {};
    if (agentType) filter.agentType = { $eq: agentType };
    if (taskType) filter.taskType = { $eq: taskType };
    try {
      return await this.pinecone.search(query, topK, filter);
    } catch (err) {
      console.error('[MEMORY] Recall failed:', err.message);
      return [];
    }
  }

  async buildContextPacket(agentType, task, taskType) {
    const [memories, episodes, stats] = await Promise.all([
      this.recall(task, { topK: 6, agentType }),
      this.pg.getRecentEpisodes(taskType || agentType, 3).catch(() => []),
      this.pg.getAgentStats(agentType).catch(() => null),
    ]);

    const parts = [];

    if (memories.length > 0) {
      parts.push('## RELEVANT MEMORY (from past experience)');
      memories.slice(0, 5).forEach((m, i) => {
        parts.push(`[${i + 1}] (relevance: ${(m.score * 100).toFixed(0)}%) ${(m.text || '').slice(0, 300)}`);
      });
    }

    if (episodes.length > 0) {
      parts.push('\n## PAST EPISODES (how this type of task was handled before)');
      episodes.forEach(ep => {
        parts.push(`- Approach: ${(ep.approach || '').slice(0, 200)}`);
        parts.push(`  Outcome score: ${ep.score}/10. Lessons: ${(ep.lessons || []).join('; ')}`);
      });
    }

    if (stats) {
      parts.push(
        `\n## YOUR PERFORMANCE: ${stats.total_tasks} tasks completed, avg score ${(stats.avg_score || 0).toFixed(1)}/10, ${stats.success_count} successes`
      );
    }

    return parts.join('\n');
  }

  async shutdown() {
    await Promise.all([this.redis.quit(), this.pg.close()]);
  }
}
