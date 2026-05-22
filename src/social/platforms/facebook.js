// Facebook Pages via Meta Graph API v18
import fetch from 'node-fetch';
import { config } from '../../config.js';

const BASE = 'https://graph.facebook.com/v18.0';

export class FacebookPublisher {
  constructor() {
    this.accessToken = config.social.meta.accessToken;
    this.pageId = config.social.meta.pageId;
  }

  async publishPost(message, link = null) {
    if (!this.accessToken || !this.pageId) throw new Error('Facebook credentials missing');

    const body = { message, access_token: this.accessToken };
    if (link) body.link = link;

    const res = await fetch(`${BASE}/${this.pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return { platform: 'facebook', postId: data.id };
  }

  async publishVideo(videoUrl, title, description) {
    if (!this.accessToken || !this.pageId) throw new Error('Facebook credentials missing');

    const res = await fetch(`${BASE}/${this.pageId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: videoUrl,
        title,
        description,
        access_token: this.accessToken,
      }),
    });

    const data = await res.json();
    return { platform: 'facebook', videoId: data.id };
  }

  async publishImage(imageUrl, caption) {
    if (!this.accessToken || !this.pageId) throw new Error('Facebook credentials missing');

    const res = await fetch(`${BASE}/${this.pageId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: imageUrl,
        caption,
        access_token: this.accessToken,
      }),
    });

    const data = await res.json();
    return { platform: 'facebook', photoId: data.id };
  }
}
