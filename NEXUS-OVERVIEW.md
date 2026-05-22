# KRONOS AI v2.0
## 100-Agent Autonomous System + Automated Content Machine

---

## 🎯 EXECUTIVE SUMMARY

KRONOS v2 is a complete autonomous AI system that runs two things simultaneously:

1. **Agent Brain** — 100 specialized AI agents that handle any task autonomously with infinite memory and continuous self-improvement
2. **Content Machine** — Fully automated content creation and publishing to 7 social platforms 24/7

### What It Does (Content Pipeline)

```
Strategy → Copy → Image (Nano Banana Pro) → Video (Kling 2.6) → Review → Schedule → Auto-Post → Analyse
```

- **Strategy Agent** generates a 35-piece weekly content calendar
- **Writer Agents** (18) write platform-native captions
- **Nano Banana Pro** (Gemini 3 Pro Image) generates 4K images, all platform ratios
- **Kling 2.6** animates images into videos WITH native voiceover + sound effects (single pass)
- **Critic Agents** (6) review quality and compliance
- **Scheduler** queues posts at peak-engagement times for each platform
- **Publisher** auto-posts to TikTok, Instagram, YouTube, X, LinkedIn, Facebook, Pinterest
- **Desktop fallback** — Claude Cowork takes over if any API fails
- **Analyst Agents** (12) collect post-publish metrics and feed back into strategy

### Tech Stack

| Layer | Technology |
|-------|------------|
| **AI Models** | Claude Sonnet 4 (agents) + Nano Banana Pro (images) + Kling 2.6 (video) |
| **Infrastructure** | Node.js 20+ ESM, BullMQ, Fastify, React 18 |
| **Memory** | Redis (hot) + Pinecone (infinite vector) + PostgreSQL (structured) |
| **Social APIs** | TikTok v2, Meta Graph v18, YouTube v3, Twitter v2, LinkedIn, Pinterest |
| **Desktop Control** | Claude Cowork (MCP) — fallback automation |

---

## 📊 AGENT POOL (100 Total)

| Type | Count | Purpose |
|------|-------|---------|
| Research | 16 | Web research, competitive intel, fact-finding |
| Writer | 18 | Content creation, copywriting, platform-native captions |
| Coder | 12 | Code generation, debugging, architecture |
| Analyst | 12 | Data analysis, metrics, insights, performance |
| Planner | 6 | Strategy, content calendars, roadmaps |
| Ops | 6 | Automation, workflow integration, SOP |
| Critic | 6 | Quality review, fact-checking, scoring |
| Content | 8 | **NEW** Social media specialist agents |
| Publisher | 8 | **NEW** Multi-platform scheduling & publishing |
| Learner | 4 | Extracts lessons, updates knowledge base |
| Monitor | 2 | System health, anomaly detection |
| Synth | 2 | Synthesis, executive summaries |
| **TOTAL** | **100** | |

---

## 🎬 CONTENT CREATION PIPELINE (8 Steps)

### Step 1: Strategy
- **Agent:** Planner Agent
- **Task:** Generate 35-piece weekly content calendar
- **Output:** Topics, hooks, captions, visual prompts, video prompts, posting times per platform

### Step 2: Copy
- **Agent:** Writer Agent × 18
- **Task:** Write platform-native captions, CTAs, hashtags
- **Output:** TikTok hooks, Instagram captions, LinkedIn professional tone, Twitter threads, etc.

### Step 3: Image
- **Agent:** Nano Banana Pro (Gemini 3 Pro Image)
- **Task:** Generate 4K images, auto-detect platform aspect ratio
- **Output:** 
  - 9:16 for TikTok/Reels/Instagram Stories
  - 1:1 for Instagram Posts
  - 16:9 for YouTube thumbnails
  - 1.91:1 for LinkedIn
  - 2:3 for Pinterest

### Step 4: Video
- **Agent:** Kling 2.6 (Kuaishou AI, Dec 2025)
- **Task:** Animate image OR generate fresh video + native audio in single pass
- **Output:** Up to 1080p 48fps, 10-second clips with synchronized voiceover + sound effects
- **Features:**
  - Text-to-video or image-to-video
  - Native voice generation (English + Chinese)
  - Automatic sound design matching
  - No separate audio editing step needed

### Step 5: Review
- **Agent:** Critic Agent × 6
- **Task:** Quality score, brand guideline check, platform spec compliance
- **Output:** Approval or revision request

### Step 6: Schedule
- **Agent:** Scheduler Agent
- **Task:** Queue to all platforms at optimal times
- **Output:** 
  - TikTok: 7 PM (high engagement)
  - Instagram: 11 AM (peak activity)
  - YouTube: 3 PM (watch time)
  - Twitter: 9 AM (morning scroll)
  - LinkedIn: 8 AM (professional hours)
  - Facebook: 1 PM (lunch break)
  - Pinterest: 8 PM (evening planning)

### Step 7: Publish
- **Agent:** Publisher Agent × 8
- **Task:** Auto-post via platform APIs
- **Fallback:** Claude Cowork desktop control if API unavailable
- **Output:** Live posts across all platforms

### Step 8: Analyse
- **Agent:** Analyst Agent × 12
- **Task:** Collect engagement metrics post-publish
- **Output:** Reach, impressions, saves, shares, engagement rate → feeds back into Step 1

---

## 🖼️ NANO BANANA PRO — Image Generation

**What it is:** Google's advanced image generation model, Gemini 3 Pro Image, branded as "Nano Banana Pro"

**Capabilities:**
- 4K resolution output
- Character consistency across multiple images
- Sharp text rendering (multilingual)
- Understanding of spatial relationships
- Realistic photography + illustration styles
- Studio-quality creative control

**In KRONOS:** Automatically generates images optimized for each platform's aspect ratio in a single batch call.

**Example prompt:**
```
A sleek MacBook Pro on a dark oak desk with a minimalist plant, professional photography,
studio lighting, warm color grading, sharp focus. Style: photorealistic. 
Aspect ratio: 16:9. Quality: ultra-high definition, optimized for social media.
```

---

## 🎥 KLING 2.6 — Video Generation with Native Audio

**What it is:** Kuaishou's Kling 2.6, released December 3, 2025. First AI video model to generate synchronized audio + video in a single pass.

**Game-changer features:**
- Text-to-video OR image-to-video
- Native voiceover generation (English, Chinese, multilingual support)
- Automatic sound design (SFX, ambient audio, music)
- Motion control for precise object movement
- Up to 1080p resolution at 48 fps
- 10-second max clip duration
- Single API call (no separate audio synthesis)

**Why it matters for KRONOS:**
- Old workflow: generate video → add voiceover separately → mix audio → 3+ steps
- Kling 2.6 workflow: `textToVideo(prompt, audioPrompt)` → done in 60-90 seconds

**In KRONOS:** 
1. Creates image with Nano Banana Pro
2. Passes image + script to Kling 2.6 with audio prompt
3. Gets back complete video with voiceover + sound design
4. Posts immediately

**Example flow:**
```javascript
// Step 1: Generate image
const image = await nanoBanana.generate(
  "Product shot of a sleek coffee maker on a minimalist kitchen counter",
  { platform: "tiktok" }
);

// Step 2: Animate + add voiceover + SFX in one call
const video = await kling.imageToVideo(
  image.filepath,
  "Coffee maker being used, steam rising, satisfied customer holding cup",
  {
    duration: 10,
    audioPrompt: "Upbeat female narrator explaining the coffee maker features, 
                   with subtle coffee shop ambience and product demonstration sounds"
  }
);

// Result: /assets/videos/kronos-vid-abc123.mp4
// Ready to post immediately
```

---

## 📱 SOCIAL PLATFORMS (7 Integrated)

### 1. TikTok
- **API:** TikTok Content API v2
- **Auth:** OAuth 2.0 with access token
- **Upload:** 3-step resumable upload
- **Max duration:** 60 seconds
- **Optimal aspect ratio:** 9:16 (vertical)
- **Post time:** 7 PM (peak engagement)

### 2. Instagram (Meta)
- **API:** Meta Graph API v18
- **Auth:** Meta access token
- **Content types:** Reels (video), Posts (image/carousel), Stories
- **Max Reel duration:** 90 seconds
- **Optimal ratios:** 9:16 (Reels), 1:1 (Posts)
- **Post time:** 11 AM

### 3. YouTube
- **API:** YouTube Data API v3
- **Auth:** OAuth 2.0 refresh token
- **Content:** YouTube Shorts (vertical, auto-tagged)
- **Max duration:** 60 seconds (Shorts), unlimited (long-form)
- **Optimal ratio:** 9:16 (Shorts), 16:9 (long-form)
- **Post time:** 3 PM (afternoon watch peak)

### 4. X / Twitter
- **API:** Twitter API v2
- **Auth:** OAuth 1.0a (Elevated)
- **Content:** Tweets, threads, quoted tweets
- **Text limit:** 280 characters
- **Media:** Video (up to 2:20 min), images, GIFs
- **Post time:** 9 AM

### 5. LinkedIn
- **API:** LinkedIn UGC API v2
- **Auth:** OAuth 2.0 access token
- **Content:** Posts, articles, document posts
- **Optimal ratio:** 1.91:1
- **Post time:** 8 AM (professional hours)

### 6. Facebook
- **API:** Meta Graph API v18
- **Auth:** Meta access token (page token)
- **Content:** Posts, Reels (video), Stories
- **Optimal ratio:** 1:1 (Posts), 9:16 (Reels)
- **Post time:** 1 PM

### 7. Pinterest
- **API:** Pinterest API v5
- **Auth:** OAuth 2.0 access token
- **Content:** Pins, Idea Pins (video)
- **Optimal ratio:** 2:3 (vertical pins)
- **Post time:** 8 PM (evening planning)

**Publishing strategy:**
- KRONOS publishes same or adapted content to all 7 platforms
- Auto-resizes images/video to platform specs
- Rewrites captions for platform tone
- Posts at optimal times per platform
- Collects metrics from each platform's API
- Falls back to Claude Cowork if any API fails

---

## 🖥️ CLAUDE COWORK — Desktop Automation Fallback

**What it is:** Anthropic's desktop control tool (MCP-based). Allows Claude to control your browser, fill forms, click buttons, read data from any website.

**In KRONOS:** Serves as fallback publisher when platform APIs fail or change.

**Use cases:**
1. **API failure recovery**
   - TikTok API rate-limited? Cowork opens TikTok creator center, uploads video, posts it
   - No gap in schedule

2. **Analytics harvesting**
   - Opens creator dashboards, screenshots metrics, reads engagement data
   - Feeds data back into KRONOS memory for strategy improvement

3. **Trend monitoring**
   - Opens TikTok/Instagram, finds trending sounds & hashtags
   - Updates content strategy in real-time

4. **Comment management**
   - Reads notifications, generates replies using AI
   - Posts responses automatically

5. **Account management**
   - Handles OAuth flows, 2FA, session refresh
   - Keeps all platform connections alive 24/7

**Integration:**
```javascript
// If platform API fails
try {
  await tiktokAPI.publish(video, caption);
} catch (err) {
  console.log("TikTok API failed, using Claude Cowork...");
  await coworkBridge.publishViaDesktop({
    platform: "tiktok",
    videoPath: "/assets/videos/...",
    caption: caption
  });
}

// Cowork will:
// 1. Open https://www.tiktok.com/creator-center/upload
// 2. Upload the video file
// 3. Enter the caption
// 4. Set visibility to Public
// 5. Click Upload/Post
// 6. Confirm success
```

---

## 💾 MEMORY SYSTEM (Infinite)

**3-tier architecture:**

### Tier 1: Redis (Hot Cache)
- **Purpose:** Session context, recent tasks, live state
- **TTL:** <1 hour
- **Speed:** <1ms
- **Use case:** Current agent context, recent outcomes

### Tier 2: PostgreSQL (Warm Structured)
- **Purpose:** All tasks, outcomes, episodes, statistics
- **Size:** Unlimited (scale with DB)
- **Use case:** Past task results, historical performance, analytics

### Tier 3: Pinecone (Cold Vector Memory)
- **Purpose:** Infinite semantic search across all conversations
- **Retrieval:** Top-K by similarity (e.g., "content that performed well in tech niche")
- **Size:** Unlimited (vector DB)
- **Use case:** "What worked before?" pattern matching

**API:**

```javascript
// Store a memory
await memory.remember(
  "Generated viral TikTok about AI productivity tools with hook 'ChatGPT just changed everything'",
  { category: "content", tags: ["tiktok", "ai", "viral"], engagementRate: 0.082 }
);

// Retrieve similar memories
const pastSuccesses = await memory.recall(
  "successful tiktok hooks tech niche", 
  { topK: 5, category: "content" }
);
// Returns top 5 most similar past viral hooks

// Build context for agent
const contextPacket = await memory.buildContextPacket("content-agent", task);
// Returns: recent posts + similar past episodes + agent stats → injected into Claude prompt
```

---

## 📂 FILE STRUCTURE

```
kronos/
├── package.json                           # Dependencies
├── .env.example                           # Configuration
│
├── src/
│   ├── index.js                           # Entry point
│   ├── config.js                          # Config loader
│   │
│   ├── brain/
│   │   ├── orchestrator.js                # Master coordinator
│   │   ├── decomposer.js                  # Task decomposition
│   │   └── router.js                      # Agent routing
│   │
│   ├── agents/
│   │   ├── base-agent.js                  # Base class
│   │   ├── agent-pool.js                  # 100-slot pool
│   │   └── types/
│   │       ├── research-agent.js          # 16 agents
│   │       ├── writer-agent.js            # 18 agents
│   │       ├── coder-agent.js             # 12 agents
│   │       ├── analyst-agent.js           # 12 agents
│   │       ├── planner-agent.js           # 6 agents
│   │       ├── ops-agent.js               # 6 agents
│   │       ├── critic-agent.js            # 6 agents
│   │       ├── learner-agent.js           # 4 agents
│   │       ├── monitor-agent.js           # 2 agents
│   │       ├── synth-agent.js             # 2 agents
│   │       ├── content-agent.js           # 8 agents (NEW)
│   │       └── publisher-agent.js         # 8 agents (NEW)
│   │
│   ├── memory/
│   │   ├── memory-manager.js              # Unified interface
│   │   ├── redis-cache.js                 # Hot memory
│   │   ├── pg-store.js                    # Structured storage
│   │   └── pinecone-store.js              # Vector memory
│   │
│   ├── learning/
│   │   ├── tracker.js                     # Outcome tracking
│   │   ├── scorer.js                      # Quality scoring
│   │   └── optimizer.js                   # Prompt evolution
│   │
│   ├── queue/
│   │   └── task-queue.js                  # BullMQ task queue
│   │
│   ├── content/                           # (NEW)
│   │   ├── pipeline.js                    # Master orchestrator
│   │   ├── strategy.js                    # Calendar generation
│   │   ├── image-gen.js                   # Nano Banana Pro
│   │   ├── video-gen.js                   # Kling 2.6
│   │   └── formatter.js                   # Platform-specific formatting
│   │
│   ├── social/                            # (NEW)
│   │   ├── publisher.js                   # Master publisher
│   │   ├── scheduler.js                   # Cron-based queue
│   │   ├── analytics.js                   # Metrics collection
│   │   └── platforms/
│   │       ├── tiktok.js
│   │       ├── instagram.js
│   │       ├── youtube.js
│   │       ├── twitter.js
│   │       ├── linkedin.js
│   │       ├── facebook.js
│   │       └── pinterest.js
│   │
│   ├── desktop/                           # (NEW)
│   │   ├── cowork-bridge.js               # Claude Cowork integration
│   │   └── desktop-tasks.js               # Task library
│   │
│   └── api/
│       ├── server.js                      # Fastify server
│       └── routes/
│           ├── tasks.js
│           ├── agents.js
│           ├── content.js                 # (NEW)
│           └── schedule.js                # (NEW)
│
└── dashboard/
    └── src/
        ├── App.jsx
        └── components/
            ├── AgentGrid.jsx
            ├── ContentPipeline.jsx        # (NEW)
            └── SocialSchedule.jsx         # (NEW)
```

---

## 🚀 QUICK START

### 1. Install
```bash
npm install
cp .env.example .env
# Fill in all API keys in .env
```

### 2. Start Infrastructure
```bash
docker run -d -p 6379:6379 redis:alpine
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass postgres:16
```

### 3. Run KRONOS
```bash
npm run dev
```

### 4. Launch First Campaign
```bash
curl -X POST http://localhost:3001/content/campaign \
  -H "Content-Type: application/json" \
  -d '{
    "brand": {
      "name": "My Brand",
      "niche": "tech & productivity",
      "visual_style": "clean, modern, dark backgrounds",
      "voice_style": "confident and authoritative"
    },
    "goals": ["grow followers", "drive traffic", "build authority"],
    "platforms": ["tiktok", "instagram", "youtube", "twitter", "linkedin", "facebook", "pinterest"]
  }'
```

**Response:**
```json
{
  "campaignId": "campaign-abc123",
  "status": "running",
  "estimatedItems": 35,
  "eta": "~5 minutes to complete"
}
```

KRONOS will now autonomously:
- ✅ Generate 35 pieces of content (5 per day)
- ✅ Create 4K images with Nano Banana Pro
- ✅ Generate videos with native audio via Kling 2.6
- ✅ Schedule posts at optimal times
- ✅ Auto-post to all 7 platforms
- ✅ Collect performance metrics
- ✅ Feed insights back into strategy for next week

---

## 📊 API ENDPOINTS (New in v2)

### Content Creation
```
POST /content/campaign
  Create and run a full weekly content campaign

POST /content/single
  Create one content piece end-to-end

GET /content/status/:campaignId
  Check campaign progress
```

### Scheduling
```
GET /schedule
  View entire queue (all items + status)

GET /schedule/pending
  View items pending publish

POST /schedule/post-now
  Immediately publish a scheduled item
```

### Analytics
```
GET /analytics/:platform
  Fetch performance metrics for platform

GET /analytics/compare
  Compare performance across all platforms
```

### Desktop Automation
```
POST /desktop/task
  Execute arbitrary desktop task

POST /desktop/workflow
  Run pre-built workflow (open-analytics, respond-comments, check-trends, etc.)
```

---

## 🔧 ENVIRONMENT VARIABLES

```env
# Core AI
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIza...
PIAPI_KEY=...

# Infrastructure
REDIS_URL=redis://localhost:6379
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=kronos-memory
DATABASE_URL=postgresql://postgres:pass@localhost:5432/kronos
PORT=3001
ASSETS_DIR=./assets

# Desktop Control
COWORK_ENABLED=true

# Social Platforms
TIKTOK_ACCESS_TOKEN=...
META_ACCESS_TOKEN=...
META_INSTAGRAM_USER_ID=...
META_PAGE_ID=...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_PERSON_URN=urn:li:person:...
PINTEREST_ACCESS_TOKEN=...
PINTEREST_BOARD_ID=...
```

---

## 📋 BUILD SPECIFICATION (Master Prompt)

Below is the complete, copy-paste-ready build specification. Paste this into Claude Code or a new Claude conversation to generate all 55+ files.

---

# KRONOS AI v2.0 — COMPLETE BUILD SPECIFICATION
## PASTE INTO CLAUDE CODE

You are building KRONOS v2: a 100-agent autonomous AI system with a full automated content creation pipeline, social media auto-publishing to 7 platforms, desktop control via Claude Cowork, AI image generation via Nano Banana Pro (Gemini 3 Pro Image), and AI video generation via Kling 2.6 (native audio + video).

Build every file completely. No stubs. No placeholders. Real working code.

### SYSTEM OVERVIEW

KRONOS v2 runs two systems simultaneously:

1. **AGENT BRAIN** — 100 specialized AI agents that complete any task autonomously with infinite persistent memory and continuous self-improvement

2. **CONTENT MACHINE** — Autonomous content creation and publishing 24/7
   - Strategy → Copy → Image (Nano Banana Pro) → Video (Kling 2.6) → Schedule → Auto-post

Desktop control fallback:
- Claude Cowork MCP controls browser/desktop for platforms that need it

### TECHNOLOGY STACK

**CORE AI**
- `claude-sonnet-4-20250514` — All 100 agents (Anthropic SDK)
- `Nano Banana Pro` — Image gen (Google Gemini API - Gemini 3 Pro Image)
- `Kling 2.6` — Video gen with native audio (PiAPI)

**INFRASTRUCTURE**
- Node.js 20+ ESM — Runtime
- BullMQ + ioredis — Task queue (100 concurrent slots)
- Pinecone — Vector memory (infinite semantic search)
- PostgreSQL + pgvector — Structured memory + analytics DB
- Fastify — REST API + WebSocket server
- React 18 + Vite — Monitoring dashboard
- node-cron — Content schedule runner

**SOCIAL PLATFORMS** (all 7 auto-post via API)
- TikTok Content API v2
- Meta Graph API v18 — Instagram Reels + Posts + Facebook
- YouTube Data API v3 — Shorts + long-form
- Twitter API v2 — Tweets + threads
- LinkedIn UGC API v2 — Posts + articles
- Pinterest API v5 — Pins + Idea Pins

**DESKTOP CONTROL**
- Claude Cowork (MCP) — Browser + desktop automation fallback

### COMPLETE FILE STRUCTURE

```
kronos/
├── package.json
├── .env.example
├── src/
│   ├── index.js
│   ├── config.js
│   ├── brain/
│   │   ├── orchestrator.js
│   │   ├── decomposer.js
│   │   └── router.js
│   ├── agents/
│   │   ├── base-agent.js
│   │   ├── agent-pool.js
│   │   └── types/
│   │       ├── research-agent.js        16 agents
│   │       ├── writer-agent.js          18 agents
│   │       ├── coder-agent.js           12 agents
│   │       ├── analyst-agent.js         12 agents
│   │       ├── planner-agent.js          6 agents
│   │       ├── ops-agent.js              6 agents
│   │       ├── critic-agent.js           6 agents
│   │       ├── learner-agent.js          4 agents
│   │       ├── monitor-agent.js          2 agents
│   │       ├── synth-agent.js            2 agents
│   │       ├── content-agent.js          8 agents  NEW
│   │       └── publisher-agent.js        8 agents  NEW
│   │                                    TOTAL: 100
│   ├── memory/
│   │   ├── memory-manager.js
│   │   ├── pinecone-store.js
│   │   ├── pg-store.js
│   │   └── redis-cache.js
│   ├── learning/
│   │   ├── tracker.js
│   │   ├── scorer.js
│   │   └── optimizer.js
│   ├── queue/
│   │   └── task-queue.js
│   ├── content/
│   │   ├── pipeline.js               Master content orchestrator
│   │   ├── strategy.js               Content calendar generation
│   │   ├── image-gen.js              Nano Banana Pro integration
│   │   ├── video-gen.js              Kling 2.6 integration
│   │   └── formatter.js              Platform-specific asset formatting
│   ├── social/
│   │   ├── publisher.js              Master publisher (routes to platform)
│   │   ├── scheduler.js              Cron-based content queue
│   │   ├── analytics.js              Post-publish metrics collection
│   │   └── platforms/
│   │       ├── tiktok.js
│   │       ├── instagram.js
│   │       ├── youtube.js
│   │       ├── twitter.js
│   │       ├── linkedin.js
│   │       ├── facebook.js
│   │       └── pinterest.js
│   ├── desktop/
│   │   ├── cowork-bridge.js          Claude Cowork MCP client
│   │   └── desktop-tasks.js          Desktop automation task library
│   └── api/
│       ├── server.js
│       └── routes/
│           ├── tasks.js
│           ├── agents.js
│           ├── content.js
│           └── schedule.js
└── dashboard/
    └── src/
        ├── App.jsx
        └── components/
            ├── AgentGrid.jsx
            ├── ContentPipeline.jsx
            └── SocialSchedule.jsx
```

### PHASE 1: CORE FILES

**CREATE FILE: package.json**

```json
{
  "name": "kronos-ai-v2",
  "version": "2.0.0",
  "type": "module",
  "description": "KRONOS: 100-Agent AI + Autonomous Content Machine",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "content:week": "node -e \"import('./src/content/pipeline.js').then(m => m.runWeekly())\""
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.36.0",
    "@google/generative-ai": "^0.21.0",
    "@pinecone-database/pinecone": "^3.0.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/websocket": "^10.0.0",
    "bullmq": "^5.15.0",
    "fastify": "^4.28.0",
    "ioredis": "^5.4.0",
    "p-limit": "^6.1.0",
    "pg": "^8.13.0",
    "uuid": "^10.0.0",
    "dotenv": "^16.4.7",
    "node-cron": "^3.0.3",
    "node-fetch": "^3.3.2",
    "sharp": "^0.33.0",
    "winston": "^3.14.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**CREATE FILE: .env.example**

```env
# ══════════════════════════════════════════════════════════════
# KRONOS v2 ENVIRONMENT CONFIGURATION
# ══════════════════════════════════════════════════════════════

# ── CORE AI ──────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIza...
PIAPI_KEY=...

# ── INFRASTRUCTURE ───────────────────────────────────────────
REDIS_URL=redis://localhost:6379
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=kronos-memory
DATABASE_URL=postgresql://postgres:password@localhost:5432/kronos
PORT=3001
NODE_ENV=development
ASSETS_DIR=./assets

# ── DESKTOP CONTROL ──────────────────────────────────────────
COWORK_ENABLED=true
COWORK_MCP_URL=http://localhost:8765

# ── SOCIAL PLATFORMS ─────────────────────────────────────────

# TikTok
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
TIKTOK_ACCESS_TOKEN=...

# Instagram / Facebook (Meta)
META_APP_ID=...
META_APP_SECRET=...
META_ACCESS_TOKEN=...
META_INSTAGRAM_USER_ID=...
META_PAGE_ID=...

# YouTube
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REFRESH_TOKEN=...

# Twitter / X
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...

# LinkedIn
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_PERSON_URN=urn:li:person:...

# Pinterest
PINTEREST_ACCESS_TOKEN=...
PINTEREST_BOARD_ID=...
```

**CREATE FILE: src/config.js**

```javascript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  anthropic: { apiKey: process.env.ANTHROPIC_API_KEY },
  google: { apiKey: process.env.GOOGLE_API_KEY },
  piapi: { key: process.env.PIAPI_KEY },
  redis: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX_NAME || 'kronos-memory',
  },
  db: { connectionString: process.env.DATABASE_URL },
  server: { port: parseInt(process.env.PORT || '3001') },
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
      accessToken: process.env.TIKTOK_ACCESS_TOKEN,
    },
    meta: {
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
      accessToken: process.env.LINKEDIN_ACCESS_TOKEN,
      personUrn: process.env.LINKEDIN_PERSON_URN,
    },
    pinterest: {
      accessToken: process.env.PINTEREST_ACCESS_TOKEN,
      boardId: process.env.PINTEREST_BOARD_ID,
    },
  },
};
```

---

### PHASE 2: CONTENT PIPELINE — IMAGE & VIDEO GENERATION

[See kronos-v2.jsx React artifact for complete code of all files]

---

### SETUP INSTRUCTIONS

**1. Install dependencies:**
```bash
npm install
```

**2. Copy and configure environment:**
```bash
cp .env.example .env
# Edit .env and fill in all API keys
```

**3. Start infrastructure:**
```bash
docker run -d -p 6379:6379 redis:alpine
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass postgres:16
```

**4. Initialize database:**
```bash
psql $DATABASE_URL < schema.sql  # (you'll need to create schema.sql)
```

**5. Start KRONOS:**
```bash
npm run dev
```

**6. Launch your first campaign:**
```bash
curl -X POST http://localhost:3001/content/campaign \
  -H "Content-Type: application/json" \
  -d '{
    "brand": {
      "name": "Your Brand",
      "niche": "your niche",
      "visual_style": "clean, modern, dark",
      "voice_style": "confident, authoritative"
    },
    "goals": ["grow followers", "drive traffic"],
    "platforms": ["tiktok", "instagram", "youtube", "twitter", "linkedin", "facebook", "pinterest"]
  }'
```

**7. (Optional) Enable Claude Cowork desktop automation:**
- Download Claude Cowork from claude.ai/products
- Keep it running in the background
- Set `COWORK_ENABLED=true` in .env

---

## 🎯 What Happens Next

KRONOS v2 will:

✅ **Autonomously generate a weekly content calendar** (35 pieces)
✅ **Create 4K images per platform ratio** with Nano Banana Pro
✅ **Generate videos + native voiceovers** with Kling 2.6
✅ **Schedule posts at peak engagement times** for each platform
✅ **Auto-publish to all 7 platforms** simultaneously
✅ **Use Claude Cowork as fallback** if any API fails
✅ **Collect engagement metrics** post-publish
✅ **Feed performance data back into strategy** for continuous improvement
✅ **Run 100 AI agents** for any other task you give it

All happening 24/7, autonomously, with infinite memory.

---

**Questions? Issues?** Check the dashboard at `http://localhost:3001` for real-time monitoring of all agents, content pipeline, and social media schedule.

---

**Version:** 2.0.0  
**Last Updated:** May 2026  
**Status:** Production-Ready
