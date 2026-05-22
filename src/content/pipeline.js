// Master content pipeline — orchestrates strategy → image → video → schedule
import { mkdirSync } from 'fs';
import { ImageGenerator } from './image-gen.js';
import { VideoGenerator } from './video-gen.js';
import { ContentStrategy } from './strategy.js';
import { config } from '../config.js';

['images', 'videos', 'thumbnails'].forEach(d => {
  mkdirSync(`${config.assetsDir}/${d}`, { recursive: true });
});

const PLATFORM_DEFAULT_TIMES = {
  tiktok: '19:00',
  instagram: '11:00',
  youtube: '15:00',
  twitter: '09:00',
  linkedin: '08:00',
  facebook: '13:00',
  pinterest: '20:00',
};

export class ContentPipeline {
  constructor(memoryManager, scheduler, eventEmitter) {
    this.memory = memoryManager;
    this.scheduler = scheduler;
    this.emit = eventEmitter || (() => {});
    this.imageGen = new ImageGenerator();
    this.videoGen = new VideoGenerator();
    this.strategy = new ContentStrategy(memoryManager);
  }

  async processContentItem(item, brand = {}) {
    const pipelineId = item.id;
    this.emit('pipeline:start', { pipelineId, topic: item.topic, platform: item.platform });

    try {
      const result = { ...item, assets: {} };

      // STEP 1: Generate image (always)
      if (item.visualPrompt) {
        this.emit('pipeline:image:start', { pipelineId });
        const imageResult = await this.imageGen.generate(item.visualPrompt, {
          platform: item.platform,
          style: brand.visual_style || 'photorealistic, professional',
        });
        result.assets.image = imageResult.images[0];
        this.emit('pipeline:image:done', { pipelineId, filepath: result.assets.image.filepath });
      }

      // STEP 2: Generate video if needed
      if (item.contentType === 'short_video' || item.contentType === 'video') {
        this.emit('pipeline:video:start', { pipelineId });
        try {
          if (result.assets.image && item.videoPrompt) {
            // Animate the Nano Banana image with Kling 2.6
            result.assets.video = await this.videoGen.imageToVideo(
              result.assets.image.filepath,
              item.videoPrompt,
              {
                aspectRatio: item.platform === 'youtube' || item.platform === 'twitter' ? '16:9' : '9:16',
                audioPrompt: item.audioNotes,
              }
            );
          } else if (item.videoPrompt) {
            // Text-to-video
            result.assets.video = await this.videoGen.generateForPlatform(
              item.videoPrompt,
              item.platform,
              brand
            );
          }
          this.emit('pipeline:video:done', { pipelineId, filepath: result.assets.video?.filepath });
        } catch (videoErr) {
          console.warn(`[PIPELINE] Video gen failed for ${pipelineId}: ${videoErr.message}`);
          result.videoError = videoErr.message;
        }
      }

      // STEP 3: Store in memory
      await this.memory.remember(
        `Content created: ${item.topic} for ${item.platform}. Hook: ${item.hook}`,
        {
          category: 'content',
          tags: [item.platform, item.contentType, item.brandGoal].filter(Boolean),
        }
      );

      // STEP 4: Persist content item
      try {
        await this.memory.pg.storeContentItem(result);
      } catch (e) {
        console.warn('[PIPELINE] DB store failed:', e.message);
      }

      // STEP 5: Schedule
      if (this.scheduler) {
        await this.scheduler.schedule({
          ...result,
          scheduledAt: this._getScheduledTime(item.platform, item.postTime, item.day),
        });
      }

      this.emit('pipeline:done', { pipelineId, platform: item.platform });
      return result;
    } catch (err) {
      console.error(`[PIPELINE] Item ${pipelineId} failed:`, err.message);
      this.emit('pipeline:error', { pipelineId, error: err.message });
      throw err;
    }
  }

  async runWeeklyPipeline(brand, goals = []) {
    console.log('[PIPELINE] Generating weekly content calendar...');
    this.emit('pipeline:calendar:start', {});

    const calendar = await this.strategy.generateWeeklyCalendar(brand, goals);
    console.log(`[PIPELINE] Calendar generated: ${calendar.length} pieces across 7 days`);
    this.emit('pipeline:calendar:done', { count: calendar.length });

    const results = [];
    // Batch in groups of 3 to respect rate limits
    for (let i = 0; i < calendar.length; i += 3) {
      const batch = calendar.slice(i, i + 3);
      const batchResults = await Promise.allSettled(
        batch.map(item => this.processContentItem(item, brand))
      );
      results.push(...batchResults);
      if (i + 3 < calendar.length) await new Promise(r => setTimeout(r, 5000));
    }

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - succeeded;
    console.log(`[PIPELINE] Done: ${succeeded} succeeded, ${failed} failed out of ${calendar.length}`);

    return {
      total: calendar.length,
      succeeded,
      failed,
      results: results.map(r => (r.status === 'fulfilled' ? r.value : { error: r.reason?.message })),
    };
  }

  _getScheduledTime(platform, postTime, day = 1) {
    const time = postTime || PLATFORM_DEFAULT_TIMES[platform.toLowerCase()] || '12:00';
    const [hours, minutes] = time.split(':').map(Number);
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + (day - 1));
    scheduled.setHours(hours, minutes, 0, 0);
    if (scheduled < new Date()) scheduled.setDate(scheduled.getDate() + 1);
    return scheduled.toISOString();
  }
}
