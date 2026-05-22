// Master publisher — routes content to the right platform with Cowork fallback
import { TikTokPublisher } from './platforms/tiktok.js';
import { InstagramPublisher } from './platforms/instagram.js';
import { YouTubePublisher } from './platforms/youtube.js';
import { TwitterPublisher } from './platforms/twitter.js';
import { LinkedInPublisher } from './platforms/linkedin.js';
import { FacebookPublisher } from './platforms/facebook.js';
import { PinterestPublisher } from './platforms/pinterest.js';

export class SocialPublisher {
  constructor(desktopBridge = null) {
    this.platforms = {
      tiktok: new TikTokPublisher(),
      instagram: new InstagramPublisher(),
      youtube: new YouTubePublisher(),
      twitter: new TwitterPublisher(),
      linkedin: new LinkedInPublisher(),
      facebook: new FacebookPublisher(),
      pinterest: new PinterestPublisher(),
    };
    this.desktop = desktopBridge;
  }

  async publish(contentItem) {
    const { platform, caption, assets, hook } = contentItem;
    const platformKey = platform.toLowerCase();
    const pub = this.platforms[platformKey];

    if (!pub) throw new Error(`Unknown platform: ${platform}`);

    const text = [hook, caption].filter(Boolean).join('\n\n');

    try {
      // Video-first for video platforms
      if (assets?.video?.filepath && ['tiktok', 'instagram', 'youtube'].includes(platformKey)) {
        if (platformKey === 'tiktok') {
          return await pub.publishVideo(assets.video.filepath, text);
        } else if (platformKey === 'youtube') {
          return await pub.publishVideo(
            assets.video.filepath,
            contentItem.topic || hook?.slice(0, 80),
            text,
            contentItem.tags || [],
            true // shorts by default
          );
        } else if (platformKey === 'instagram') {
          // Instagram needs a public URL — we'd upload to S3 or similar first
          // For now: try image if no public video URL
          if (assets.video.publicUrl) {
            return await pub.publishVideo(assets.video.publicUrl, text);
          } else if (assets.image?.publicUrl) {
            return await pub.publishImage(assets.image.publicUrl, text);
          } else {
            throw new Error('Instagram needs public asset URL — upload to CDN first');
          }
        }
      }

      // Image-based platforms
      if (assets?.image?.filepath && pub.publishImage) {
        const url = assets.image.publicUrl || assets.image.filepath;
        return await pub.publishImage(url, text);
      }

      // Pinterest needs image
      if (platformKey === 'pinterest' && assets?.image) {
        return await pub.publishPin(
          contentItem.topic?.slice(0, 100) || 'Pin',
          text,
          assets.image.publicUrl || assets.image.filepath
        );
      }

      // Text-only platforms
      if (pub.publishPost) {
        return await pub.publishPost(text);
      } else if (pub.tweet) {
        return await pub.tweet(text);
      }

      throw new Error(`No suitable publish method for ${platform}`);
    } catch (err) {
      console.error(`[PUBLISHER] ${platform} API failed: ${err.message}`);

      // Fallback: Claude Cowork desktop control
      if (this.desktop?.enabled) {
        console.log(`[PUBLISHER] Falling back to Claude Cowork for ${platform}`);
        return this.desktop.publishViaDesktop(contentItem);
      }
      throw err;
    }
  }

  async publishToAll(contentItem, platforms = null) {
    const targetPlatforms = platforms || Object.keys(this.platforms);
    const results = await Promise.allSettled(
      targetPlatforms.map(p => this.publish({ ...contentItem, platform: p }))
    );
    return Object.fromEntries(
      targetPlatforms.map((p, i) => [
        p,
        results[i].status === 'fulfilled' ? results[i].value : { error: results[i].reason?.message },
      ])
    );
  }
}
