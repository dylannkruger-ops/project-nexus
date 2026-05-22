// Kling 2.6 — Kuaishou's AI video generation with native audio (Dec 2025)
// Single-pass video + voiceover + SFX + ambient audio. Up to 1080p 48fps 10s clips
// API: PiAPI (https://piapi.ai/kling-2-6)

import fetch from 'node-fetch';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

const PIAPI_BASE = 'https://api.piapi.ai/api/kling/v1';

const PLATFORM_CONFIGS = {
  tiktok:    { aspectRatio: '9:16', duration: 10, style: 'trendy, fast-cut, energetic' },
  instagram: { aspectRatio: '9:16', duration: 10, style: 'aesthetic, polished, vibrant' },
  youtube:   { aspectRatio: '16:9', duration: 10, style: 'cinematic, clear, engaging' },
  twitter:   { aspectRatio: '16:9', duration: 5,  style: 'concise, impactful, attention-grabbing' },
  linkedin:  { aspectRatio: '16:9', duration: 10, style: 'professional, authoritative, polished' },
  facebook:  { aspectRatio: '16:9', duration: 10, style: 'broad-appeal, engaging' },
};

export class VideoGenerator {
  constructor() {
    this.apiKey = config.piapi.key;
    this.assetsDir = config.assetsDir;
  }

  get headers() {
    return {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async _ensureDir() {
    await mkdir(join(this.assetsDir, 'videos'), { recursive: true });
  }

  async textToVideo(prompt, options = {}) {
    await this._ensureDir();
    const {
      duration = 5,
      aspectRatio = '9:16',
      audio = true,
      audioPrompt = '',
      resolution = '720p',
      negativePrompt = 'blurry, watermark, text overlay, poor quality, distorted',
    } = options;

    const body = {
      model_name: 'kling-v2-6',
      prompt,
      negative_prompt: negativePrompt,
      duration,
      aspect_ratio: aspectRatio,
      audio_generation: audio,
      audio_prompt: audioPrompt || `Professional voiceover and matching sound design for: ${prompt.slice(0, 100)}`,
      resolution,
      cfg_scale: 0.5,
    };

    const submitRes = await fetch(`${PIAPI_BASE}/text2video`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    const submitData = await submitRes.json();
    if (!submitData.task_id) {
      throw new Error(`Kling 2.6 submit failed: ${JSON.stringify(submitData)}`);
    }

    return this._pollForResult(submitData.task_id);
  }

  async imageToVideo(imagePath, prompt, options = {}) {
    await this._ensureDir();
    const { duration = 5, aspectRatio = '9:16', audio = true } = options;

    const imageData = await readFile(imagePath);
    const base64Image = imageData.toString('base64');

    const body = {
      model_name: 'kling-v2-6',
      prompt,
      image: `data:image/png;base64,${base64Image}`,
      duration,
      aspect_ratio: aspectRatio,
      audio_generation: audio,
      audio_prompt: `Natural sound design and ambient audio matching: ${prompt.slice(0, 100)}`,
    };

    const submitRes = await fetch(`${PIAPI_BASE}/image2video`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    const submitData = await submitRes.json();
    if (!submitData.task_id) {
      throw new Error(`Kling 2.6 i2v failed: ${JSON.stringify(submitData)}`);
    }

    return this._pollForResult(submitData.task_id);
  }

  async _pollForResult(taskId, maxWait = 300000, interval = 8000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      await new Promise(r => setTimeout(r, interval));

      const statusRes = await fetch(`${PIAPI_BASE}/task/${taskId}`, {
        headers: this.headers,
      });
      const data = await statusRes.json();

      if (data.status === 'completed' && data.output?.video_url) {
        const filename = `kronos-vid-${uuidv4()}.mp4`;
        const filepath = join(this.assetsDir, 'videos', filename);
        const videoRes = await fetch(data.output.video_url);
        const buffer = Buffer.from(await videoRes.arrayBuffer());
        await writeFile(filepath, buffer);

        return {
          taskId,
          filename,
          filepath,
          videoUrl: data.output.video_url,
          duration: data.output.duration,
          hasAudio: true,
        };
      }

      if (data.status === 'failed') {
        throw new Error(`Kling 2.6 failed: ${data.error || 'unknown'}`);
      }

      console.log(`[KLING 2.6] ${taskId}: ${data.status} (${Math.floor((Date.now() - start) / 1000)}s)`);
    }
    throw new Error(`Kling 2.6 timed out after ${maxWait / 1000}s`);
  }

  async generateForPlatform(concept, platform, brand = {}) {
    const cfg = PLATFORM_CONFIGS[platform.toLowerCase()] || PLATFORM_CONFIGS.instagram;
    const prompt = `${concept}. Style: ${cfg.style}. ${brand.visual_style || 'Modern and professional.'} Optimized for ${platform}.`;

    return this.textToVideo(prompt, {
      duration: cfg.duration,
      aspectRatio: cfg.aspectRatio,
      audioPrompt: `${brand.voice_style || 'Confident, clear narrator'} voice with matching music and sound design for ${platform} content`,
    });
  }
}
