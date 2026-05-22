// Post-publish analytics collector
import fetch from 'node-fetch';
import { config } from '../config.js';

const META_BASE = 'https://graph.facebook.com/v18.0';

export class Analytics {
  constructor(memoryManager) {
    this.memory = memoryManager;
  }

  async collectInstagramMetrics(mediaId) {
    const token = config.social.meta.accessToken;
    const fields = 'impressions,reach,saved,profile_visits,likes,comments,shares';
    const res = await fetch(
      `${META_BASE}/${mediaId}/insights?metric=${fields}&access_token=${token}`
    );
    const data = await res.json();
    return this._normalizeMetrics(data.data || []);
  }

  async collectFacebookMetrics(postId) {
    const token = config.social.meta.accessToken;
    const fields = 'post_impressions,post_engaged_users,post_reactions_like_total';
    const res = await fetch(
      `${META_BASE}/${postId}/insights?metric=${fields}&access_token=${token}`
    );
    const data = await res.json();
    return this._normalizeMetrics(data.data || []);
  }

  async collectYouTubeMetrics(videoId) {
    // Would use YouTube Analytics API — requires OAuth flow
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics&key=${config.google.apiKey}`
    );
    const data = await res.json();
    const stats = data.items?.[0]?.statistics || {};
    return {
      views: parseInt(stats.viewCount || 0),
      likes: parseInt(stats.likeCount || 0),
      comments: parseInt(stats.commentCount || 0),
    };
  }

  _normalizeMetrics(raw) {
    const metrics = {};
    for (const m of raw) {
      metrics[m.name] = m.values?.[0]?.value || 0;
    }
    return metrics;
  }

  async storeMetrics(contentItemId, platform, metrics) {
    await this.memory.pg.updateContentStatus(contentItemId, 'published', null, metrics);
    await this.memory.remember(
      `Engagement on ${platform}: ${JSON.stringify(metrics)}`,
      {
        category: 'analytics',
        tags: [platform],
        engagementScore: this._computeEngagementScore(metrics),
      }
    );
  }

  _computeEngagementScore(metrics) {
    const reach = metrics.reach || metrics.impressions || metrics.views || 0;
    const engagement = (metrics.likes || 0) + (metrics.comments || 0) * 3 + (metrics.shares || 0) * 5 + (metrics.saved || 0) * 2;
    return reach > 0 ? engagement / reach : 0;
  }

  async getTopPerformers(platform, limit = 10) {
    const res = await this.memory.pg.pool.query(
      `SELECT * FROM content_items WHERE platform=$1 AND engagement_data IS NOT NULL ORDER BY (engagement_data->>'reach')::int DESC LIMIT $2`,
      [platform, limit]
    );
    return res.rows;
  }

  async harvestAllRecent() {
    // Pull recent published content from DB and refresh metrics
    const res = await this.memory.pg.pool.query(
      `SELECT id, platform, platform_post_id FROM content_items
       WHERE status='published' AND published_at > NOW() - INTERVAL '7 days' AND platform_post_id IS NOT NULL`
    );

    for (const row of res.rows) {
      try {
        let metrics = {};
        if (row.platform === 'instagram') metrics = await this.collectInstagramMetrics(row.platform_post_id);
        else if (row.platform === 'facebook') metrics = await this.collectFacebookMetrics(row.platform_post_id);
        else if (row.platform === 'youtube') metrics = await this.collectYouTubeMetrics(row.platform_post_id);

        if (Object.keys(metrics).length > 0) {
          await this.storeMetrics(row.id, row.platform, metrics);
        }
      } catch (err) {
        console.warn(`[ANALYTICS] ${row.platform}/${row.platform_post_id}: ${err.message}`);
      }
    }
  }
}
