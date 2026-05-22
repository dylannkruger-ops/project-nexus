import Redis from 'ioredis';
import { config } from '../config.js';

export class RedisCache {
  constructor() {
    this.client = new Redis(config.redis.url, { maxRetriesPerRequest: 3 });
    this.client.on('error', err => console.error('[REDIS]', err.message));
    this.client.on('connect', () => console.log('[REDIS] Connected'));
  }

  async set(key, value, ttlSeconds = 3600) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async get(key) {
    const raw = await this.client.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  async del(key) {
    return this.client.del(key);
  }

  async setContext(agentId, context) {
    await this.set(`agent:ctx:${agentId}`, context, 1800);
  }

  async getContext(agentId) {
    return this.get(`agent:ctx:${agentId}`);
  }

  async setActiveTask(taskId, task) {
    await this.set(`task:active:${taskId}`, task, 7200);
  }

  async getActiveTask(taskId) {
    return this.get(`task:active:${taskId}`);
  }

  async pushRecentTask(task) {
    const key = 'tasks:recent';
    await this.client.lpush(key, JSON.stringify(task));
    await this.client.ltrim(key, 0, 99);
    await this.client.expire(key, 86400);
  }

  async getRecentTasks(limit = 20) {
    const raw = await this.client.lrange('tasks:recent', 0, limit - 1);
    return raw.map(r => JSON.parse(r));
  }

  async incrementStat(key, by = 1) {
    return this.client.incrby(`stat:${key}`, by);
  }

  async getStat(key) {
    const v = await this.client.get(`stat:${key}`);
    return parseInt(v || '0');
  }

  async getAllStats() {
    const keys = await this.client.keys('stat:*');
    const stats = {};
    for (const k of keys) {
      stats[k.replace('stat:', '')] = parseInt((await this.client.get(k)) || '0');
    }
    return stats;
  }

  async quit() {
    await this.client.quit();
  }
}
