import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;

export class PgStore {
  constructor() {
    this.pool = new Pool({ connectionString: config.db.connectionString });
    this.pool.on('error', err => console.error('[PG]', err.message));
  }

  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        type VARCHAR(50),
        input TEXT,
        result TEXT,
        agent_type VARCHAR(50),
        score FLOAT,
        duration_ms INTEGER,
        retries INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS agent_stats (
        agent_type VARCHAR(50) PRIMARY KEY,
        total_tasks INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        avg_score FLOAT DEFAULT 0,
        avg_duration_ms INTEGER DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS knowledge_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        category VARCHAR(100),
        tags TEXT[],
        source_task_id UUID,
        confidence FLOAT DEFAULT 0.8,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS episodes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_type VARCHAR(50),
        input_summary TEXT,
        approach TEXT,
        outcome TEXT,
        score FLOAT,
        lessons TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS content_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform VARCHAR(50),
        content_type VARCHAR(50),
        topic TEXT,
        hook TEXT,
        caption TEXT,
        image_path TEXT,
        video_path TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        scheduled_at TIMESTAMPTZ,
        published_at TIMESTAMPTZ,
        platform_post_id TEXT,
        engagement_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS publish_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_item_id UUID,
        platform VARCHAR(50),
        status VARCHAR(20),
        error TEXT,
        response JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
      CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_type);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(task_type);
      CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
      CREATE INDEX IF NOT EXISTS idx_content_platform ON content_items(platform);
      CREATE INDEX IF NOT EXISTS idx_content_scheduled ON content_items(scheduled_at);
    `);
    console.log('[POSTGRES] Schema ready');
  }

  async storeTask(task) {
    const { id, type, input, agentType } = task;
    await this.pool.query(
      `INSERT INTO tasks (id, type, input, agent_type, status)
       VALUES ($1, $2, $3, $4, 'running')
       ON CONFLICT (id) DO NOTHING`,
      [id, type, input, agentType]
    );
  }

  async updateOutcome(taskId, result, score, durationMs) {
    await this.pool.query(
      `UPDATE tasks SET result=$1, score=$2, duration_ms=$3, status='completed', completed_at=NOW() WHERE id=$4`,
      [typeof result === 'string' ? result : JSON.stringify(result), score, durationMs, taskId]
    );

    const task = await this.pool.query('SELECT agent_type FROM tasks WHERE id=$1', [taskId]);
    if (task.rows[0]) {
      const at = task.rows[0].agent_type;
      await this.pool.query(
        `INSERT INTO agent_stats (agent_type, total_tasks, success_count, avg_score)
         VALUES ($1, 1, $2, $3)
         ON CONFLICT (agent_type) DO UPDATE SET
           total_tasks = agent_stats.total_tasks + 1,
           success_count = agent_stats.success_count + EXCLUDED.success_count,
           avg_score = (agent_stats.avg_score * agent_stats.total_tasks + EXCLUDED.avg_score) / (agent_stats.total_tasks + 1),
           updated_at = NOW()`,
        [at, score >= 7 ? 1 : 0, score]
      );
    }
  }

  async storeKnowledge(content, category, tags = [], sourceTaskId = null) {
    const res = await this.pool.query(
      `INSERT INTO knowledge_items (content, category, tags, source_task_id) VALUES ($1, $2, $3, $4) RETURNING id`,
      [content, category, tags, sourceTaskId]
    );
    return res.rows[0].id;
  }

  async getAgentStats(agentType) {
    const res = await this.pool.query('SELECT * FROM agent_stats WHERE agent_type=$1', [agentType]);
    return res.rows[0] || null;
  }

  async getAllAgentStats() {
    const res = await this.pool.query('SELECT * FROM agent_stats ORDER BY total_tasks DESC');
    return res.rows;
  }

  async getRecentEpisodes(taskType, limit = 5) {
    const res = await this.pool.query(
      'SELECT * FROM episodes WHERE task_type=$1 ORDER BY score DESC LIMIT $2',
      [taskType, limit]
    );
    return res.rows;
  }

  async storeEpisode(episode) {
    const { taskType, inputSummary, approach, outcome, score, lessons } = episode;
    await this.pool.query(
      `INSERT INTO episodes (task_type, input_summary, approach, outcome, score, lessons)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [taskType, inputSummary, approach, outcome, score, lessons || []]
    );
  }

  async storeContentItem(item) {
    const res = await this.pool.query(
      `INSERT INTO content_items (platform, content_type, topic, hook, caption, image_path, video_path, scheduled_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        item.platform, item.contentType, item.topic, item.hook, item.caption,
        item.assets?.image?.filepath, item.assets?.video?.filepath,
        item.scheduledAt, item.status || 'pending',
      ]
    );
    return res.rows[0].id;
  }

  async updateContentStatus(id, status, platformPostId = null, engagementData = null) {
    await this.pool.query(
      `UPDATE content_items SET status=$1, published_at=CASE WHEN $1='published' THEN NOW() ELSE published_at END,
        platform_post_id=COALESCE($2, platform_post_id), engagement_data=COALESCE($3, engagement_data) WHERE id=$4`,
      [status, platformPostId, engagementData ? JSON.stringify(engagementData) : null, id]
    );
  }

  async logPublish(contentItemId, platform, status, error = null, response = null) {
    await this.pool.query(
      `INSERT INTO publish_log (content_item_id, platform, status, error, response)
       VALUES ($1, $2, $3, $4, $5)`,
      [contentItemId, platform, status, error, response ? JSON.stringify(response) : null]
    );
  }

  async getMetrics() {
    const [tasks, agents, content] = await Promise.all([
      this.pool.query(`SELECT COUNT(*) as total, AVG(score) as avg_score, AVG(duration_ms) as avg_duration FROM tasks WHERE status='completed'`),
      this.pool.query(`SELECT * FROM agent_stats ORDER BY total_tasks DESC`),
      this.pool.query(`SELECT status, COUNT(*) as count FROM content_items GROUP BY status`),
    ]);
    return { tasks: tasks.rows[0], agents: agents.rows, content: content.rows };
  }

  async close() {
    await this.pool.end();
  }
}
