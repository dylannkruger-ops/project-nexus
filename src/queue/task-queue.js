// BullMQ-based task queue with worker pool
import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config.js';

export class TaskQueue {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.connection = new IORedis(config.redis.url, { maxRetriesPerRequest: null });
    this.queue = new Queue('kronos-tasks', { connection: this.connection });
    this.events = new QueueEvents('kronos-tasks', { connection: this.connection });
    this.worker = null;
  }

  start() {
    this.worker = new Worker(
      'kronos-tasks',
      async job => {
        const { task, options } = job.data;
        return this.orchestrator.processTask(task, options);
      },
      {
        connection: new IORedis(config.redis.url, { maxRetriesPerRequest: null }),
        concurrency: config.agents.maxConcurrent,
      }
    );

    this.worker.on('completed', job => {
      console.log(`[QUEUE] ✓ Job ${job.id}`);
    });
    this.worker.on('failed', (job, err) => {
      console.error(`[QUEUE] ✗ Job ${job?.id}: ${err.message}`);
    });

    console.log('[QUEUE] Workers started');
  }

  async addTask(task, options = {}) {
    const priorityMap = { critical: 1, high: 2, normal: 3, low: 4, background: 5 };
    const priority = priorityMap[options.priority] || 3;

    const job = await this.queue.add(
      'process',
      { task, options },
      {
        priority,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 86400, count: 1000 },
        removeOnFail: { age: 604800 },
      }
    );
    return job.id;
  }

  async getStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }

  async getJob(jobId) {
    return this.queue.getJob(jobId);
  }

  async close() {
    await this.worker?.close();
    await this.queue.close();
    await this.events.close();
  }
}
