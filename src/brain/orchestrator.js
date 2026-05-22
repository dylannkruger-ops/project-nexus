import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';
import { decompose } from './decomposer.js';
import { routeTask } from './router.js';

export class Orchestrator {
  constructor(agentPool, memoryManager) {
    this.pool = agentPool;
    this.memory = memoryManager;
    this.activeTasks = new Map();
    this.completedCount = 0;
    this.eventListeners = new Set();
  }

  onEvent(fn) {
    this.eventListeners.add(fn);
  }

  offEvent(fn) {
    this.eventListeners.delete(fn);
  }

  emit(event, data) {
    this.eventListeners.forEach(fn => {
      try {
        fn(event, data);
      } catch (e) {
        console.error('[ORCH] Listener error:', e.message);
      }
    });
  }

  async processTask(taskInput, options = {}) {
    const taskId = uuidv4();
    const startTime = Date.now();
    this.activeTasks.set(taskId, { id: taskId, input: taskInput, status: 'decomposing', startTime });
    this.emit('task:start', { taskId, input: taskInput });

    try {
      // 1. Decompose into subtasks
      const subtasks = await decompose(taskInput);
      this.emit('task:decomposed', { taskId, subtasks: subtasks.length });
      console.log(`[ORCH] Task ${taskId.slice(0, 8)}: ${subtasks.length} subtasks planned`);

      // 2. Execute subtasks respecting dependencies
      const results = {};
      const executedIds = new Set();

      const execute = async subtask => {
        if (executedIds.has(subtask.id)) return results[subtask.id];

        // Resolve dependencies first
        for (const dep of subtask.dependsOn || []) {
          const depTask = subtasks.find(s => s.id === dep);
          if (depTask && !executedIds.has(dep)) await execute(depTask);
        }

        const depContext = (subtask.dependsOn || [])
          .map(dep => results[dep]?.result)
          .filter(Boolean)
          .join('\n\n');

        const input = depContext
          ? `Context from previous steps:\n${depContext}\n\nYour task: ${subtask.description}`
          : subtask.description;

        this.emit('subtask:start', { taskId, subtaskId: subtask.id, agentType: subtask.agentType });

        try {
          const result = await this.pool.runWithAgent(
            subtask.agentType,
            input,
            subtask.id,
            subtask.agentType
          );
          results[subtask.id] = result;
          executedIds.add(subtask.id);
          this.emit('subtask:done', { taskId, subtaskId: subtask.id, agentType: subtask.agentType });
          return result;
        } catch (err) {
          console.error(`[ORCH] Subtask ${subtask.id} failed:`, err.message);
          results[subtask.id] = { error: err.message, agentType: subtask.agentType };
          executedIds.add(subtask.id);
          this.emit('subtask:error', { taskId, subtaskId: subtask.id, error: err.message });
          return results[subtask.id];
        }
      };

      const limiter = pLimit(10);
      await Promise.all(subtasks.map(st => limiter(() => execute(st))));

      // 3. Identify final result (last subtask or synthesis)
      const finalSubtask = subtasks[subtasks.length - 1];
      const finalResult = results[finalSubtask?.id] || Object.values(results).slice(-1)[0];

      const duration = Date.now() - startTime;
      this.completedCount++;
      this.activeTasks.delete(taskId);

      // 4. Store episode for learning
      try {
        await this.memory.pg.storeEpisode({
          taskType: routeTask(taskInput),
          inputSummary: taskInput.slice(0, 200),
          approach: subtasks.map(s => s.agentType).join(' → '),
          outcome: finalResult?.summary || '',
          score: finalResult?.score || (finalResult?.confidence || 0.7) * 10,
          lessons: [],
        });

        await this.memory.redis.pushRecentTask({
          id: taskId,
          input: taskInput.slice(0, 200),
          result: finalResult?.summary || '',
          durationMs: duration,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('[ORCH] Episode store failed:', e.message);
      }

      this.emit('task:done', { taskId, durationMs: duration });
      return {
        taskId,
        result: finalResult,
        allResults: results,
        subtasks: subtasks.length,
        durationMs: duration,
      };
    } catch (err) {
      this.activeTasks.delete(taskId);
      this.emit('task:error', { taskId, error: err.message });
      throw err;
    }
  }

  getStatus() {
    return {
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedCount,
      agentPool: this.pool.getStatus(),
      totalAgents: this.pool.getTotalAgents(),
    };
  }
}
