// ╔══════════════════════════════════════════════════════╗
// ║              KRONOS AI v2.0 — ENTRY POINT             ║
// ║   100 Agents · Content Machine · 7-Platform Auto-Post ║
// ╚══════════════════════════════════════════════════════╝

import { config, validateConfig } from './config.js';
import { MemoryManager } from './memory/memory-manager.js';
import { AgentPool } from './agents/agent-pool.js';
import { Orchestrator } from './brain/orchestrator.js';
import { TaskQueue } from './queue/task-queue.js';
import { ContentPipeline } from './content/pipeline.js';
import { ContentScheduler } from './social/scheduler.js';
import { Analytics } from './social/analytics.js';
import { CoworkBridge } from './desktop/cowork-bridge.js';
import { OutcomeTracker } from './learning/tracker.js';
import { Scorer } from './learning/scorer.js';
import { PromptOptimizer } from './learning/optimizer.js';
import { buildServer } from './api/server.js';
import { mkdirSync } from 'fs';

['images', 'videos', 'thumbnails'].forEach(d => {
  mkdirSync(`${config.assetsDir}/${d}`, { recursive: true });
});

const BANNER = `
╔══════════════════════════════════════════════════════╗
║                                                       ║
║    ██╗  ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗ ███████║
║    ██║ ██╔╝██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔════║
║    █████╔╝ ██████╔╝██║   ██║██╔██╗ ██║██║   ██║███████║
║    ██╔═██╗ ██╔══██╗██║   ██║██║╚██╗██║██║   ██║╚════██║
║    ██║  ██╗██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝███████║
║    ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚══════║
║                                                       ║
║              AUTONOMOUS AI BRAIN v2.0                 ║
║                                                       ║
╚══════════════════════════════════════════════════════╝
`;

async function main() {
  console.log(BANNER);
  validateConfig();

  // 1. Memory layer
  console.log('[BOOT] Initializing memory systems...');
  const memory = new MemoryManager();
  await memory.init();

  // 2. Desktop bridge (Claude Cowork)
  const desktop = new CoworkBridge();
  console.log(`[BOOT] Claude Cowork: ${desktop.enabled ? '✓ ENABLED' : '○ standby (COWORK_ENABLED=false)'}`);

  // 3. Content scheduler
  const scheduler = new ContentScheduler(memory, desktop);
  scheduler.start();

  // 4. Content pipeline
  const pipeline = new ContentPipeline(memory, scheduler);

  // 5. Agent pool (100 agents)
  console.log('[BOOT] Spinning up 100 agents...');
  const pool = new AgentPool(memory);

  // 6. Orchestrator
  const orchestrator = new Orchestrator(pool, memory);

  // 7. Learning system
  const tracker = new OutcomeTracker(memory);
  const scorer = new Scorer();
  const optimizer = new PromptOptimizer(memory, tracker);

  // 8. Task queue
  const queue = new TaskQueue(orchestrator);
  queue.start();

  // 9. Analytics
  const analytics = new Analytics(memory);

  // 10. API server
  const server = buildServer({
    orchestrator,
    taskQueue: queue,
    memoryManager: memory,
    pipeline,
    scheduler,
    desktopBridge: desktop,
    analytics,
  });

  await server.listen({ port: config.server.port, host: '0.0.0.0' });

  console.log('\n┌─────────────────────────────────────────────────┐');
  console.log('│  ✓ KRONOS AI v2.0 ONLINE                         │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log(`│  API           http://localhost:${config.server.port}`.padEnd(50) + '│');
  console.log(`│  Agents        ${pool.getTotalAgents()} ready (12 specializations)`.padEnd(50) + '│');
  console.log(`│  Platforms     TikTok · IG · YT · X · LI · FB · Pin`.padEnd(50) + '│');
  console.log(`│  Image gen     Nano Banana Pro (Gemini 3 Pro)`.padEnd(50) + '│');
  console.log(`│  Video gen     Kling 2.6 (native audio + video)`.padEnd(50) + '│');
  console.log(`│  Desktop       Claude Cowork ${desktop.enabled ? '✓' : '○'}`.padEnd(50) + '│');
  console.log(`│  Memory        Redis + Pinecone + PostgreSQL`.padEnd(50) + '│');
  console.log('└─────────────────────────────────────────────────┘\n');

  // Graceful shutdown
  const shutdown = async signal => {
    console.log(`\n[SHUTDOWN] ${signal} received, closing gracefully...`);
    scheduler.stop();
    await queue.close();
    await memory.shutdown();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
