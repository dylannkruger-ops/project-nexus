// Fastify API server — REST + WebSocket for KRONOS
import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';

export function buildServer({ orchestrator, taskQueue, memoryManager, pipeline, scheduler, desktopBridge, analytics }) {
  const app = Fastify({ logger: false });

  app.register(cors, { origin: true });
  app.register(websocket);

  // ─── Health & Status ──────────────────────────────
  app.get('/health', async () => ({
    status: 'online',
    timestamp: new Date().toISOString(),
    ...orchestrator.getStatus(),
  }));

  app.get('/status', async () => ({
    orchestrator: orchestrator.getStatus(),
    queue: await taskQueue.getStats(),
    scheduler: {
      pending: scheduler.getPending().length,
      published: scheduler.getPublished().length,
      failed: scheduler.getFailed().length,
    },
    desktop: { enabled: desktopBridge.enabled },
  }));

  // ─── Task Routes ──────────────────────────────────
  app.post('/task', async (req, reply) => {
    const { task, priority = 'normal' } = req.body || {};
    if (!task) return reply.code(400).send({ error: 'task required' });
    const jobId = await taskQueue.addTask(task, { priority });
    return { jobId, status: 'queued', task };
  });

  app.post('/task/sync', async (req, reply) => {
    const { task } = req.body || {};
    if (!task) return reply.code(400).send({ error: 'task required' });
    try {
      return await orchestrator.processTask(task);
    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

  app.get('/tasks', async () => memoryManager.redis.getRecentTasks(20));

  app.get('/tasks/:jobId', async req => {
    const job = await taskQueue.getJob(req.params.jobId);
    if (!job) return { error: 'not found' };
    return {
      id: job.id,
      data: job.data,
      progress: job.progress,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
    };
  });

  // ─── Agent Routes ─────────────────────────────────
  app.get('/agents', async () => orchestrator.getStatus());
  app.get('/agents/stats', async () => memoryManager.pg.getAllAgentStats());

  // ─── Content Routes ───────────────────────────────
  app.post('/content/campaign', async (req, reply) => {
    const { brand, goals = [], platforms } = req.body || {};
    if (!brand) return reply.code(400).send({ error: 'brand required' });

    // Run async — return immediately
    pipeline.runWeeklyPipeline(brand, goals).catch(err => {
      console.error('[CAMPAIGN] Failed:', err.message);
    });

    return {
      status: 'started',
      message: 'Campaign running in background. Check /schedule for queued items.',
      brand: brand.name || 'unnamed',
      platforms: platforms || 'all',
    };
  });

  app.post('/content/single', async (req, reply) => {
    const { topic, platform, brand, contentType = 'image' } = req.body || {};
    if (!topic || !platform) return reply.code(400).send({ error: 'topic and platform required' });

    try {
      const spec = await pipeline.strategy.generateSinglePost(topic, platform, brand || {}, contentType);
      const result = await pipeline.processContentItem(spec, brand || {});
      return result;
    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

  app.get('/content/recent', async () => {
    const res = await memoryManager.pg.pool.query(
      'SELECT * FROM content_items ORDER BY created_at DESC LIMIT 50'
    );
    return res.rows;
  });

  // ─── Schedule Routes ──────────────────────────────
  app.get('/schedule', async () => scheduler.getQueue());
  app.get('/schedule/pending', async () => scheduler.getPending());
  app.get('/schedule/published', async () => scheduler.getPublished());
  app.get('/schedule/failed', async () => scheduler.getFailed());

  app.post('/schedule/post-now', async (req, reply) => {
    const { itemId } = req.body || {};
    if (!itemId) return reply.code(400).send({ error: 'itemId required' });
    try {
      return await scheduler.postNow(itemId);
    } catch (err) {
      return reply.code(404).send({ error: err.message });
    }
  });

  // ─── Memory Routes ────────────────────────────────
  app.get('/memory/search', async req => {
    const { q, topK = 10 } = req.query;
    if (!q) return { results: [] };
    return { results: await memoryManager.recall(q, { topK: parseInt(topK) }) };
  });

  // ─── Analytics Routes ─────────────────────────────
  app.get('/analytics/top/:platform', async req => {
    return analytics.getTopPerformers(req.params.platform, 10);
  });

  app.post('/analytics/harvest', async () => {
    analytics.harvestAllRecent().catch(err => console.error('[HARVEST]', err.message));
    return { status: 'started' };
  });

  // ─── Desktop / Cowork Routes ──────────────────────
  app.post('/desktop/task', async (req, reply) => {
    const { instruction, context } = req.body || {};
    if (!instruction) return reply.code(400).send({ error: 'instruction required' });
    try {
      return await desktopBridge.executeDesktopTask(instruction, context || {});
    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

  app.post('/desktop/workflow', async (req, reply) => {
    const { workflowName, params } = req.body || {};
    if (!workflowName) return reply.code(400).send({ error: 'workflowName required' });
    try {
      return await desktopBridge.runWorkflow(workflowName, params || {});
    } catch (err) {
      return reply.code(500).send({ error: err.message });
    }
  });

  // ─── Metrics ──────────────────────────────────────
  app.get('/metrics', async () => memoryManager.pg.getMetrics());

  // ─── WebSocket for live events ────────────────────
  app.register(async fastify => {
    fastify.get('/ws', { websocket: true }, socket => {
      const handler = (event, data) => {
        if (socket.readyState === 1) {
          socket.send(JSON.stringify({ event, data, timestamp: Date.now() }));
        }
      };
      orchestrator.onEvent(handler);
      scheduler.onEvent(handler);

      socket.on('close', () => {
        orchestrator.offEvent(handler);
      });
    });
  });

  return app;
}
