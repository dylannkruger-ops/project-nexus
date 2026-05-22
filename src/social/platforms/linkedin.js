// LinkedIn UGC API v2
import fetch from 'node-fetch';
import { config } from '../../config.js';

const BASE = 'https://api.linkedin.com/v2';

export class LinkedInPublisher {
  constructor() {
    this.accessToken = config.social.linkedin.accessToken;
    this.personUrn = config.social.linkedin.personUrn;
  }

  async publishPost(text, imageUrl = null) {
    if (!this.accessToken || !this.personUrn) throw new Error('LinkedIn credentials missing');

    const body = {
      author: this.personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: imageUrl ? 'IMAGE' : 'NONE',
          ...(imageUrl && {
            media: [
              {
                status: 'READY',
                description: { text: text.slice(0, 200) },
                originalUrl: imageUrl,
              },
            ],
          }),
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const res = await fetch(`${BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return {
      platform: 'linkedin',
      postId: data.id,
      url: data.id ? `https://www.linkedin.com/feed/update/${data.id}/` : null,
    };
  }
}
