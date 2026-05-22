// Content strategy engine — generates weekly content calendar using Claude
import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const STRATEGY_SYSTEM = `You are a senior social media strategist. Generate detailed, actionable content calendars
optimized for each platform's algorithm, audience, and best practices.

Output ONLY valid JSON. No commentary outside the JSON.`;

export class ContentStrategy {
  constructor(memoryManager) {
    this.memory = memoryManager;
  }

  async generateWeeklyCalendar(brand, goals = []) {
    const pastPerformance = await this.memory
      .recall('top performing content engagement analytics', { topK: 5 })
      .catch(() => []);

    const prompt = `Generate a 7-day social media content calendar for this brand.

BRAND:
${JSON.stringify(brand, null, 2)}

GOALS: ${goals.join(', ')}

PAST PERFORMANCE INSIGHTS:
${pastPerformance.map(p => p.text).join('\n').slice(0, 1000)}

PLATFORMS: TikTok, Instagram (Reels + Posts), YouTube Shorts, Twitter/X, LinkedIn, Facebook, Pinterest

For each day, create 3-5 content pieces. For each piece specify ALL of:
{
  "id": "unique-id",
  "day": 1-7,
  "platform": "tiktok|instagram|youtube|twitter|linkedin|facebook|pinterest",
  "contentType": "short_video|image|carousel|thread|article",
  "topic": "specific topic",
  "hook": "opening hook / headline (first 3 seconds)",
  "caption": "full caption with all hashtags inline",
  "visualPrompt": "detailed prompt for Nano Banana Pro image generation - be specific about composition, lighting, subject, mood",
  "videoPrompt": "detailed prompt for Kling 2.6 video generation - describe motion, camera, scene, audio (only if contentType is short_video)",
  "audioNotes": "voice style, music mood, SFX notes (for videos)",
  "postTime": "optimal posting time HH:MM in 24h format",
  "estimatedEngagement": "low|medium|high",
  "brandGoal": "awareness|engagement|conversion|retention"
}

Aim for ~25-35 total pieces across the week. Mix content types per platform.
Return a valid JSON array.`;

    const res = await client.messages.create({
      model: config.agents.model,
      max_tokens: 8096,
      system: STRATEGY_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });

    const jsonMatch = res.content[0].text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array in strategy response');
    const calendar = JSON.parse(jsonMatch[0]);

    return calendar.map(item => ({
      ...item,
      id: item.id || uuidv4(),
      status: 'pending',
    }));
  }

  async generateSinglePost(topic, platform, brand, contentType = 'image') {
    const res = await client.messages.create({
      model: config.agents.model,
      max_tokens: 2048,
      system: STRATEGY_SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Create one ${contentType} post for ${platform} about: ${topic}
Brand: ${JSON.stringify(brand)}

Return JSON with all fields: id, platform, contentType, topic, hook, caption, visualPrompt, videoPrompt (if video), audioNotes, postTime, hashtags[], brandGoal`,
        },
      ],
    });

    const jsonMatch = res.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object in response');
    const item = JSON.parse(jsonMatch[0]);
    return { ...item, id: item.id || uuidv4(), status: 'pending' };
  }
}
