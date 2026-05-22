// Claude Cowork integration — desktop automation via MCP/computer use
// When social APIs fail or aren't available, Cowork takes over via browser control

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const PLATFORM_URLS = {
  tiktok: 'https://www.tiktok.com/creator-center/upload',
  instagram: 'https://www.instagram.com',
  youtube: 'https://studio.youtube.com',
  twitter: 'https://twitter.com/compose/tweet',
  linkedin: 'https://www.linkedin.com/post/new',
  facebook: 'https://www.facebook.com',
  pinterest: 'https://www.pinterest.com/pin-builder',
};

export class CoworkBridge {
  constructor() {
    this.enabled = config.cowork.enabled;
    this.mcpUrl = config.cowork.mcpUrl;
  }

  async executeDesktopTask(instruction, context = {}) {
    if (!this.enabled) {
      throw new Error('Claude Cowork not enabled. Set COWORK_ENABLED=true and start the Cowork app.');
    }

    console.log(`[COWORK] Executing: ${instruction.slice(0, 100)}...`);

    const response = await client.messages.create({
      model: config.agents.model,
      max_tokens: 4096,
      system: `You are controlling a desktop computer via Claude Cowork.
You can control browsers, click elements, fill forms, and take actions on any website or app.
Context: ${JSON.stringify(context)}
Be precise. Complete the task fully. Confirm success at the end.`,
      messages: [{ role: 'user', content: instruction }],
      tools: [
        {
          name: 'computer',
          type: 'computer_20241022',
          display_width_px: 1920,
          display_height_px: 1080,
        },
      ],
    });

    return {
      instruction,
      result: response.content,
      stopReason: response.stop_reason,
      usage: response.usage,
    };
  }

  async publishViaDesktop(contentItem) {
    const { platform, caption, assets, hook } = contentItem;
    const url = PLATFORM_URLS[platform.toLowerCase()];

    if (!url) throw new Error(`No desktop URL mapping for ${platform}`);

    const text = [hook, caption].filter(Boolean).join('\n\n');
    const mediaInstruction = assets?.video?.filepath
      ? `Upload this video file: ${assets.video.filepath}`
      : assets?.image?.filepath
      ? `Upload this image file: ${assets.image.filepath}`
      : '';

    const instruction = `Go to ${url} and post the following content:

Caption/Post text:
${text.slice(0, 500)}

${mediaInstruction}

After upload completes:
1. Verify the content looks correct
2. Set visibility to Public
3. Click the Publish/Post button
4. Wait for confirmation the post went live
5. Report back the post URL if available`;

    return this.executeDesktopTask(instruction, {
      platform,
      contentType: contentItem.contentType,
      action: 'publish',
    });
  }

  async runWorkflow(workflowName, params = {}) {
    const workflows = {
      'open-analytics': `Open the ${params.platform || 'Instagram'} analytics/insights dashboard.
Capture and report these key metrics from the last 28 days:
- Total reach and impressions
- Engagement rate
- Follower growth
- Top 5 performing posts with their metrics
- Best posting times`,

      'respond-comments': `Go to ${params.platform || 'Instagram'} notifications.
Read the 10 most recent comments on your posts.
For each, write a thoughtful response based on this template: "${params.template || 'Thanks for engaging!'}"
Vary the wording for each one. Post each reply.`,

      'check-trends': `Open ${params.platform || 'TikTok'} and navigate to the trending/discover page.
Find and capture:
- Top 5 trending sounds with their names and creators
- Top 10 trending hashtags in the ${params.niche || 'general'} niche
- 3 emerging content formats you observe
Report back the findings.`,

      'harvest-leads': `Go to ${params.platform || 'LinkedIn'} and check connection requests.
For each new connection request from someone matching: "${params.criteria || 'any'}":
- Accept the request
- Note their name, role, and company
Build a list of new contacts and report it.`,

      'refresh-tokens': `Open ${params.platform} settings/developer page.
Navigate to the API access section.
Refresh any expired access tokens.
Copy the new token values and report them back.`,
    };

    const instruction = workflows[workflowName] || params.instruction;
    if (!instruction) throw new Error(`Unknown workflow: ${workflowName}. Available: ${Object.keys(workflows).join(', ')}`);

    return this.executeDesktopTask(instruction, { workflow: workflowName, ...params });
  }
}
