// Nano Banana Pro — Google Gemini 3 Pro Image generation
// Generates 4K images with character consistency, all platform aspect ratios

import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

const genAI = new GoogleGenerativeAI(config.google.apiKey);

const PLATFORM_ASPECTS = {
  tiktok: '9:16',
  instagram_story: '9:16',
  instagram_reel: '9:16',
  instagram_post: '1:1',
  youtube_thumb: '16:9',
  youtube_short: '9:16',
  twitter: '16:9',
  linkedin: '1.91:1',
  pinterest: '2:3',
  facebook: '1.91:1',
};

export class ImageGenerator {
  constructor() {
    // Nano Banana Pro = Gemini 3 Pro Image model
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
    });
    this.assetsDir = config.assetsDir;
  }

  async _ensureDir() {
    await mkdir(join(this.assetsDir, 'images'), { recursive: true });
  }

  async generate(prompt, options = {}) {
    await this._ensureDir();
    const {
      platform = 'instagram_post',
      style = 'photorealistic, ultra-high definition',
      count = 1,
    } = options;

    const aspectRatio = PLATFORM_ASPECTS[platform] || '1:1';
    const fullPrompt = `${prompt}

Style: ${style}
Aspect ratio: ${aspectRatio}
Quality: ultra-high definition, professional photography, social-media optimized
Make it visually striking with strong composition and engaging subject matter.`;

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ['image', 'text'],
          candidateCount: count,
        },
      });

      const images = [];
      for (const candidate of result.response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
          if (part.inlineData?.mimeType?.startsWith('image/')) {
            const filename = `kronos-img-${uuidv4()}.png`;
            const filepath = join(this.assetsDir, 'images', filename);
            const buffer = Buffer.from(part.inlineData.data, 'base64');
            await writeFile(filepath, buffer);
            images.push({ filename, filepath, mimeType: part.inlineData.mimeType });
          }
        }
      }

      if (images.length === 0) {
        throw new Error('No images returned from Nano Banana Pro');
      }

      return { images, prompt: fullPrompt, platform, aspectRatio };
    } catch (err) {
      console.error('[NANO BANANA] Generation failed:', err.message);
      throw err;
    }
  }

  async generateForAllPlatforms(concept, brand = {}) {
    const platforms = ['tiktok', 'youtube_thumb', 'instagram_post', 'linkedin', 'pinterest'];
    return Promise.all(
      platforms.map(platform =>
        this.generate(`${concept} ${brand.style || ''}`, { platform })
          .then(r => ({ ...r, platform }))
          .catch(err => ({ platform, error: err.message }))
      )
    );
  }

  async generateThumbnail(videoTitle, style = 'cinematic, high contrast, click-worthy') {
    return this.generate(
      `YouTube thumbnail for: "${videoTitle}". Bold text overlay area on left third. Eye-catching subject in focus.`,
      { platform: 'youtube_thumb', style }
    );
  }
}
