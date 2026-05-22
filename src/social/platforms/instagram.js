// Instagram via Meta Graph API v18
import fetch from 'node-fetch';
import { config } from '../../config.js';

const BASE = 'https://graph.facebook.com/v18.0';

export class InstagramPublisher {
  constructor() {
    this.accessToken = config.social.meta.accessToken;
    this.userId = config.social.meta.instagramUserId;
  }

  async publishVideo(videoUrl, caption) {
    if (!this.accessToken || !this.userId) throw new Error('Instagram credentials missing');

    // Step 1: Create REELS container
    const containerRes = await fetch(`${BASE}/${this.userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'REELS',
        video_url: videoUrl,
        caption,
        access_token: this.accessToken,
        share_to_feed: true,
      }),
    });

    const containerData = await containerRes.json();
    if (!containerData.id) throw new Error(`IG container failed: ${JSON.stringify(containerData)}`);

    // Step 2: Wait for processing (Reels need 30+ sec)
    await new Promise(r => setTimeout(r, 30000));

    // Step 3: Publish
    const publishRes = await fetch(`${BASE}/${this.userId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: this.accessToken,
      }),
    });

    const publishData = await publishRes.json();
    return {
      platform: 'instagram',
      mediaId: publishData.id,
      containerId: containerData.id,
      type: 'reel',
    };
  }

  async publishImage(imageUrl, caption) {
    if (!this.accessToken || !this.userId) throw new Error('Instagram credentials missing');

    const containerRes = await fetch(`${BASE}/${this.userId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: this.accessToken }),
    });

    const containerData = await containerRes.json();
    if (!containerData.id) throw new Error(`IG image container failed`);

    await new Promise(r => setTimeout(r, 5000));

    const publishRes = await fetch(`${BASE}/${this.userId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: this.accessToken,
      }),
    });

    const data = await publishRes.json();
    return { platform: 'instagram', mediaId: data.id, type: 'post' };
  }
}
