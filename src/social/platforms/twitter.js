// Twitter / X API v2 with OAuth 1.0a signing
import fetch from 'node-fetch';
import crypto from 'crypto';
import { config } from '../../config.js';

export class TwitterPublisher {
  constructor() {
    this.apiKey = config.social.twitter.apiKey;
    this.apiSecret = config.social.twitter.apiSecret;
    this.accessToken = config.social.twitter.accessToken;
    this.accessSecret = config.social.twitter.accessSecret;
  }

  _oauthHeader(method, url, params = {}) {
    const oauthParams = {
      oauth_consumer_key: this.apiKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_token: this.accessToken,
      oauth_version: '1.0',
    };

    const allParams = { ...params, ...oauthParams };
    const baseString = Object.keys(allParams)
      .sort()
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
      .join('&');

    const sigBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(baseString)}`;
    const sigKey = `${encodeURIComponent(this.apiSecret)}&${encodeURIComponent(this.accessSecret)}`;
    oauthParams.oauth_signature = crypto.createHmac('sha1', sigKey).update(sigBase).digest('base64');

    return (
      'OAuth ' +
      Object.keys(oauthParams)
        .map(k => `${k}="${encodeURIComponent(oauthParams[k])}"`)
        .join(', ')
    );
  }

  async tweet(text) {
    const url = 'https://api.twitter.com/2/tweets';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: this._oauthHeader('POST', url),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.slice(0, 280) }),
    });

    const data = await res.json();
    return {
      platform: 'twitter',
      tweetId: data.data?.id,
      url: data.data?.id ? `https://twitter.com/i/web/status/${data.data.id}` : null,
    };
  }

  async thread(tweets) {
    let replyTo = null;
    const posted = [];

    for (const text of tweets) {
      const body = { text: text.slice(0, 280) };
      if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };

      const url = 'https://api.twitter.com/2/tweets';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: this._oauthHeader('POST', url),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      replyTo = data.data?.id;
      posted.push(data);
    }

    return { platform: 'twitter', thread: posted };
  }

  async publishPost(text) {
    return this.tweet(text);
  }
}
