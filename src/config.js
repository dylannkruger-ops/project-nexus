import dotenv from 'dotenv';
dotenv.config();

export const config = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
  piapi: {
    key: process.env.PIAPI_KEY,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME || 'kronos-memory',
  },
  db: {
    connectionString: process.env.DATABASE_URL,
  },
  server: {
    port: parseInt(process.env.PORT || '3001'),
  },
  agents: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_AGENTS || '20'),
    timeoutMs: parseInt(process.env.AGENT_TIMEOUT_MS || '120000'),
    model: 'claude-sonnet-4-20250514',
    maxTokens: 8096,
  },
  assetsDir: process.env.ASSETS_DIR || './assets',
  cowork: {
    enabled: process.env.COWORK_ENABLED === 'true',
    mcpUrl: process.env.COWORK_MCP_URL || 'http://localhost:8765',
  },
  social: {
    tiktok: {
      clientKey: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      accessToken: process.env.TIKTOK_ACCESS_TOKEN,
    },
    meta: {
      appId: process.env.META_APP_ID,
      appSecret: process.env.META_APP_SECRET,
      accessToken: process.env.META_ACCESS_TOKEN,
      instagramUserId: process.env.META_INSTAGRAM_USER_ID,
      pageId: process.env.META_PAGE_ID,
    },
    youtube: {
      clientId: process.env.YOUTUBE_CLIENT_ID,
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
    },
    twitter: {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      personUrn: process.env.LINKEDIN_PERSON_URN,
    },
    pinterest: {
      accessToken: process.env.PINTEREST_ACCESS_TOKEN,
      boardId: process.env.PINTEREST_BOARD_ID,
    },
  },
};

export const validateConfig = () => {
  const required = ['ANTHROPIC_API_KEY'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.warn(`[CONFIG] Missing required env vars: ${missing.join(', ')}`);
  }
};
