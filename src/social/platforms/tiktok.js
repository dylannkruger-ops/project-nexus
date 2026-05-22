// TikTok Content Posting API v2
import fetch from 'node-fetch';
import { readFile, stat } from 'fs/promises';
import { config } from '../../config.js';

const BASE = 'https://open.tiktokapis.com/v2';

export class TikTokPublisher {
  constructor() {
    this.accessToken = config.social.tiktok.accessToken;
  }

  async publishVideo(videoPath, caption, options = {}) {
    if (!this.accessToken) throw new Error('TIKTOK_ACCESS_TOKEN missing');

    const stats = await stat(videoPath);

    // Step 1: Init upload
    const initRes = await fetch(`${BASE}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: {
          title: caption.slice(0, 150),
          privacy_level: options.privacy || 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: stats.size,
          chunk_size: stats.size,
          total_chunk_count: 1,
        },
      }),
    });

    const initData = await initRes.json();
    if (!initData.data?.publish_id) {
      throw new Error(`TikTok init failed: ${JSON.stringify(initData)}`);
    }

    const { publish_id, upload_url } = initData.data;
    const videoBuffer = await readFile(videoPath);

    // Step 2: Upload video bytes
    await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
      },
      body: videoBuffer,
    });

    // Step 3: Poll status
    await new Promise(r => setTimeout(r, 10000));
    const statusRes = await fetch(`${BASE}/post/publish/status/fetch/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publish_id }),
    });

    const statusData = await statusRes.json();
    return {
      platform: 'tiktok',
      publishId: publish_id,
      status: statusData.data?.status,
      url: statusData.data?.publicaly_available_post_id
        ? `https://www.tiktok.com/@/video/${statusData.data.publicaly_available_post_id}`
        : null,
    };
  }

  async publishImage() {
    throw new Error('TikTok image posts not supported via this publisher');
  }
}
