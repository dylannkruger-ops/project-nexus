import { BaseAgent } from '../base-agent.js';

export class ContentAgent extends BaseAgent {
  constructor(memoryManager) {
    super('content', {
      role: 'Content creation specialist for social media',
      capabilities: [
        'Social media content strategy',
        'Platform-specific caption writing (TikTok, Instagram, YouTube, X, LinkedIn, Facebook, Pinterest)',
        'Trending topic research and hook creation',
        'Content calendar planning',
        'Hashtag strategy and optimization',
        'Brand voice consistency',
        'Viral content pattern analysis',
        'Image prompt engineering (for Nano Banana Pro)',
        'Video prompt engineering (for Kling 2.6)',
        'A/B test variation creation',
      ],
    }, memoryManager);
  }

  getSystemPrompt(task, contextPacket) {
    return super.getSystemPrompt(task, contextPacket) + `

CONTENT CREATION RULES:
- Every piece of content needs: hook (first 3 seconds), value, CTA
- Adapt tone per platform: casual for TikTok, professional for LinkedIn, punchy for Twitter
- Research trending formats before proposing content
- Always include platform-optimized hashtags
- Think engagement first: comments, shares, saves over just views
- When writing visualPrompt for Nano Banana Pro: be specific about composition, lighting, mood
- When writing videoPrompt for Kling 2.6: describe motion, camera moves, audio mood`;
  }
}
