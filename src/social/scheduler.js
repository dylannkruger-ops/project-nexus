// Content scheduler — cron-driven auto-poster
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import { SocialPublisher } from './publisher.js';

export class ContentScheduler {
  constructor(memoryManager, desktopBridge = null) {
    this.memory = memoryManager;
    this.publisher = new SocialPublisher(desktopBridge);
    this.queue = []; // In-memory queue; mirrors to PG for persistence
    this.running = false;
    this.cronTask = null;
    this.eventListeners = new Set();
  }

  onEvent(fn) {
    this.eventListeners.add(fn);
  }

  emit(event, data) {
    this.eventListeners.forEach(fn => {
      try {
        fn(event, data);
      } catch {}
    });
  }

  async schedule(contentItem) {
    const scheduled = {
      ...contentItem,
      id: contentItem.id || uuidv4(),
      scheduledAt: contentItem.scheduledAt || new Date().toISOString(),
      status: 'scheduled',
    };
    this.queue.push(scheduled);

    try {
      await this.memory.remember(
        `Scheduled: ${contentItem.topic} for ${contentItem.platform} at ${scheduled.scheduledAt}`,
        { category: 'schedule', tags: [contentItem.platform] }
      );
    } catch {}

    this.emit('scheduled', scheduled);
    return scheduled;
  }

  start() {
    if (this.running) return;
    this.running = true;

    this.cronTask = cron.schedule('* * * * *', async () => {
      const now = new Date();
      const due = this.queue.filter(
        item => item.status === 'scheduled' && new Date(item.scheduledAt) <= now
      );

      for (const item of due) {
        item.status = 'publishing';
        this.emit('publishing', item);

        try {
          const result = await this.publisher.publish(item);
          item.status = 'published';
          item.result = result;
          item.publishedAt = new Date().toISOString();

          console.log(`[SCHEDULER] ✓ Published: ${item.topic} → ${item.platform}`);

          await this.memory.remember(
            `Published: ${item.topic} to ${item.platform}. Result: ${JSON.stringify(result).slice(0, 200)}`,
            { category: 'published', outcome: 'success', tags: [item.platform] }
          );

          try {
            if (item.dbId) {
              await this.memory.pg.updateContentStatus(item.dbId, 'published', result.postId || result.mediaId || result.videoId || result.publishId);
              await this.memory.pg.logPublish(item.dbId, item.platform, 'success', null, result);
            }
          } catch {}

          this.emit('published', item);
        } catch (err) {
          item.status = 'failed';
          item.error = err.message;
          item.failedAt = new Date().toISOString();

          console.error(`[SCHEDULER] ✗ Failed: ${item.topic} → ${item.platform}: ${err.message}`);

          try {
            if (item.dbId) {
              await this.memory.pg.logPublish(item.dbId, item.platform, 'failed', err.message);
            }
          } catch {}

          this.emit('failed', item);
        }
      }
    });

    console.log('[SCHEDULER] Started — checking queue every minute');
  }

  stop() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.running = false;
      console.log('[SCHEDULER] Stopped');
    }
  }

  getQueue() {
    return this.queue;
  }

  getPending() {
    return this.queue.filter(i => i.status === 'scheduled');
  }

  getPublished() {
    return this.queue.filter(i => i.status === 'published');
  }

  getFailed() {
    return this.queue.filter(i => i.status === 'failed');
  }

  async postNow(itemId) {
    const item = this.queue.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');
    item.scheduledAt = new Date().toISOString();
    return item;
  }
}
