// Pinterest API v5
import fetch from 'node-fetch';
import { config } from '../../config.js';

const BASE = 'https://api.pinterest.com/v5';

export class PinterestPublisher {
  constructor() {
    this.accessToken = config.social.pinterest.accessToken;
    this.boardId = config.social.pinterest.boardId;
  }

  async publishPin(title, description, imageUrl, link = null) {
    if (!this.accessToken || !this.boardId) throw new Error('Pinterest credentials missing');

    const res = await fetch(`${BASE}/pins`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: this.boardId,
        title: title.slice(0, 100),
        description: description.slice(0, 500),
        media_source: { source_type: 'image_url', url: imageUrl },
        ...(link && { link }),
      }),
    });

    const data = await res.json();
    return {
      platform: 'pinterest',
      pinId: data.id,
      url: data.id ? `https://www.pinterest.com/pin/${data.id}/` : null,
    };
  }

  async publishImage(imageUrl, caption) {
    return this.publishPin(caption.slice(0, 100), caption, imageUrl);
  }

  async publishPost(text) {
    throw new Error('Pinterest requires an image — use publishPin or publishImage');
  }
}
