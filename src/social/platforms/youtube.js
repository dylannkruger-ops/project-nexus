// YouTube Data API v3
import fetch from 'node-fetch';
import { readFile, stat } from 'fs/promises';
import { config } from '../../config.js';

export class YouTubePublisher {
  constructor() {
    this.clientId = config.social.youtube.clientId;
    this.clientSecret = config.social.youtube.clientSecret;
    this.refreshToken = config.social.youtube.refreshToken;
    this._accessToken = null;
    this._tokenExpiry = 0;
  }

  async getAccessToken() {
    if (this._accessToken && Date.now() < this._tokenExpiry) return this._accessToken;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await res.json();
    if (!data.access_token) throw new Error(`YT token refresh failed: ${JSON.stringify(data)}`);

    this._accessToken = data.access_token;
    this._tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this._accessToken;
  }

  async publishVideo(videoPath, title, description, tags = [], isShort = true) {
    const token = await this.getAccessToken();
    const videoBuffer = await readFile(videoPath);
    const stats = await stat(videoPath);

    // Step 1: Resumable upload init
    const metaRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Length': stats.size,
          'X-Upload-Content-Type': 'video/mp4',
        },
        body: JSON.stringify({
          snippet: {
            title: isShort ? `${title} #Shorts` : title,
            description: `${description}\n\n${isShort ? '#Shorts' : ''}`,
            tags: [...tags, ...(isShort ? ['Shorts', 'short'] : [])],
            categoryId: '22',
          },
          status: { privacyStatus: 'public', selfDeclaredMadeForKids: false },
        }),
      }
    );

    const uploadUrl = metaRes.headers.get('location');
    if (!uploadUrl) throw new Error('YT upload URL not returned');

    // Step 2: Upload bytes
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'video/mp4' },
      body: videoBuffer,
    });

    const result = await uploadRes.json();
    return {
      platform: 'youtube',
      videoId: result.id,
      url: result.id ? `https://www.youtube.com/watch?v=${result.id}` : null,
      isShort,
    };
  }
}
