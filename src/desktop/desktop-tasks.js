// Pre-built desktop instruction templates for Claude Cowork

export const DESKTOP_TASKS = {
  // ─── Posting ───────────────────────────────────────
  postToTikTok: (videoPath, caption) =>
    `Navigate to https://www.tiktok.com/creator-center/upload.
Upload the video at ${videoPath}.
Enter this caption: "${caption}"
Set visibility to Public, allow comments, duets, and stitches.
Click Post and wait for confirmation.`,

  postToInstagramReel: (videoPath, caption) =>
    `Open instagram.com and log in if needed.
Click the + Create button at the top.
Select Post or Reel.
Upload the file at ${videoPath}.
Write this caption: "${caption}"
Click Share and wait for the upload to complete.`,

  postToYouTubeShorts: (videoPath, title, description) =>
    `Go to studio.youtube.com.
Click the Create button, then Upload videos.
Upload the file: ${videoPath}.
Set title: "${title} #Shorts"
Set description: "${description}"
Set visibility to Public.
Mark as Not made for kids.
Click Publish.`,

  postToTwitter: text =>
    `Go to twitter.com/compose/tweet.
Type this exactly: "${text.slice(0, 280)}"
Click Post.
Wait for confirmation.`,

  postToLinkedIn: (text, mediaPath = null) =>
    `Go to linkedin.com.
Click Start a post.
${mediaPath ? `Attach media from: ${mediaPath}. ` : ''}Write this text: "${text}"
Set visibility to Anyone.
Click Post.`,

  postToFacebook: (text, mediaPath = null) =>
    `Open facebook.com.
${mediaPath ? `Click Photo/Video, attach: ${mediaPath}. ` : 'Click What\'s on your mind?'}
Type: "${text}"
Set audience to Public.
Click Post.`,

  postToPinterest: (title, description, imagePath, link = null) =>
    `Go to pinterest.com/pin-builder.
Upload image from: ${imagePath}.
Title: "${title}"
Description: "${description}"
${link ? `Destination link: ${link}. ` : ''}Select a board and click Publish.`,

  // ─── Analytics ─────────────────────────────────────
  collectTikTokAnalytics: () =>
    `Open TikTok Creator Center Analytics.
Capture metrics: total views, follower count, profile views, engagement rate from last 28 days.
List the top 5 performing videos with their view counts.`,

  collectInstagramInsights: () =>
    `Open Instagram Professional Dashboard.
Capture: reach, impressions, follower growth, top-performing posts, peak posting times this week.`,

  collectYouTubeAnalytics: () =>
    `Go to studio.youtube.com/channel/analytics.
Capture: subscribers gained, total views, watch time hours, top 5 videos by views in the last 28 days.`,

  // ─── Trend research ────────────────────────────────
  findTrendingHashtags: (platform, niche) =>
    `Open ${platform} and search for content in the "${niche}" niche.
Find the top 10 hashtags used by posts with 100k+ engagement.
Report the list with usage frequency.`,

  findTrendingSounds: () =>
    `Open TikTok.
Go to the Sounds or Discover page.
Identify the top 10 trending sounds right now.
For each: note the sound name, creator, and a sample of who's using it.`,

  // ─── Engagement ────────────────────────────────────
  respondToComments: (platform, responseTemplate) =>
    `Go to ${platform} notifications.
For each of the 10 most recent comments, respond with a variation of: "${responseTemplate}".
Make each response feel personal and unique.`,

  thankNewFollowers: platform =>
    `Open ${platform} notifications.
Find new followers from the last 24 hours.
For each, send a brief DM thanking them and asking what kind of content they like.`,
};
