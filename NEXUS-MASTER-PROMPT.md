You are building NEXUS — a production-grade AI operating system for a real business. This is not a demo or prototype. Build every file completely with working code. No stubs. No placeholders. No "add your logic here" comments.

---

# WHAT NEXUS IS

NEXUS is an AI operating system — not a chatbot. One central brain that coordinates 100 specialist agents, shared memory, connected tools, automations, approvals, and continuous improvement loops so it can run real business work 24/7.

The system runs two things simultaneously:

1. **AGENT BRAIN** — 100 specialist AI agents that receive any goal, decompose it into jobs, route those jobs to the right agents and tools, store what matters, automate repeatable actions, and improve future performance using traces, memory, and evaluation feedback.

2. **CONTENT MACHINE** — Fully automated content creation and publishing pipeline:
   Strategy → Copy → Image → Video → Review → Schedule → Publish → Analyse → Repeat

---

# TECH STACK

## AI Models
- `claude-opus-4-20250514` — Chief Brain, strategic decisions, complex reasoning
- `claude-sonnet-4-20250514` — All 100 agents, fast execution, content creation
- **Nano Banana Pro** (Gemini 3 Pro Image via `@google/generative-ai`) — 4K image generation
- **Kling 2.6** (via PiAPI at `https://api.piapi.ai/api/kling/v1`) — Video + native voiceover + SFX
- **Perplexity API** — Real-time web research for all research agents

## Infrastructure
- **Node.js 20+ ESM** — Runtime (all files use `import/export`)
- **BullMQ + ioredis** — Task queue, 100 concurrent slots
- **Fastify** — REST API + WebSocket server
- **node-cron** — Scheduled content posting
- **p-limit** — Concurrency control
- **React 18 + Vite** — PULSE monitoring dashboard

## Memory (3-tier)
- **Redis** — Hot cache, session memory, live state (<1ms)
- **Pinecone** — Vector DB, infinite semantic search
- **PostgreSQL** — Structured storage, analytics, episodic log

## Desktop Control
- **Claude Cowork** (MCP) — Desktop automation fallback publisher

## Social Platforms (7)
- TikTok Content API v2
- Meta Graph API v18 (Instagram Reels + Facebook)
- YouTube Data API v3 (Shorts + long-form)
- Twitter API v2 with OAuth 1.0a
- LinkedIn UGC API v2
- Pinterest API v5

---

# SYSTEM ARCHITECTURE (7 Layers)

## Layer 1: Interface
React 18 PULSE dashboard. Animated agent network canvas, brain visualization (particle cloud), live log feed, 5 tabs (Agents/Brain/Memory/Tools/Usage), stats bar (MRR/Leads/Tasks/Uptime), built-in chat panel with text + voice + file upload that calls Claude API directly.

## Layer 2: Brain
Main NEXUS controller. Receives goals, classifies into domains, retrieves relevant memory, builds execution plan (sequential vs parallel jobs), dispatches to agent pool, synthesizes results, routes to automation layer.

## Layer 3: Agents
100 specialist agents in 3 tiers:

**Core Always-On (7):**
- NEXUS Chief Brain
- Planner
- Memory Manager
- Evaluator
- Policy Guard
- Automation Controller
- Scheduler

**On-Demand Specialists (14):**
- Research Agent (Perplexity-powered)
- Trend Agent
- Writer Agent
- Script Agent
- Coding Agent (Claude Code + Replit Agent 4)
- Debug Agent
- Shopify/Product Agent
- Customer Support Agent
- Thumbnail/Creative Agent (Nano Banana Pro)
- Video Prompt Agent (Kling 2.6)
- Reporting Agent
- Social Platform Formatter
- Social Publishing Agent
- Analytics Agent

**Background Automation (8):**
- Memory Summarizer
- Log Compressor
- Asset Tagger
- Queue Monitor
- Performance Tracker
- Trigger Monitor
- Retry and Failure Handler
- Calendar Sync Agent

## Layer 4: Tools
External capabilities routed by agents:
Perplexity search, Claude Code CLI, Replit Agent 4, GitHub API, Nano Banana Pro image gen, Kling 2.6 video gen, Redis, Pinecone, PostgreSQL, file system, social platform APIs, Claude Cowork desktop.

## Layer 5: Automation
Triggers, schedules, queues, retries, webhooks, approvals, background jobs.

3 operating modes:
- **Manual** — user gives a goal directly
- **Scheduled** — time-based workflows run automatically
- **Triggered** — external event (webhook, product drop, new upload) starts a workflow

## Layer 6: Social Connector
Platform-specific adapters for all 7 platforms. Each adapter handles: auth/token refresh, post formatting, media packaging, scheduling, approval gates, publishing, retries, analytics pullback. Claude Cowork fallback if any API fails.

## Layer 7: Memory & Learning
7 memory types:
- **Session** — current workflow state, pending approvals
- **Episodic** — every run, action, post, error, and outcome
- **Semantic** — brand facts, product info, platform rules
- **Procedural** — SOPs, approved workflows, templates
- **Asset** — images, videos, copy blocks, code snippets
- **Scheduling** — queues, calendars, posting windows
- **Evaluation** — scores, quality notes, performance data

---

# GUARDRAILS (4 Risk Levels)

- **Low** — auto-approve: research, summarization, drafting
- **Medium** — auto-approve: generating files, queuing posts, editing drafts
- **High** — requires approval: public posting, deploying changes, sending messages
- **Critical** — requires approval: purchases, billing, deleting data, credential changes

---

# COMPLETE FILE STRUCTURE

```
project-nexus/
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── setup.ps1                        Windows one-click installer
│
├── src/
│   ├── index.js                     Entry point + boot sequence
│   ├── config.js                    Env var loader + validation
│   │
│   ├── brain/
│   │   ├── orchestrator.js          Master coordinator, event emitter
│   │   ├── decomposer.js            Claude-powered goal → subtasks
│   │   └── router.js                Regex-based task → agent routing
│   │
│   ├── agents/
│   │   ├── base-agent.js            BaseAgent class, retry logic, memory integration
│   │   ├── agent-pool.js            100-slot pool, p-limit concurrency
│   │   └── types/
│   │       ├── research-agent.js    Perplexity API integration
│   │       ├── writer-agent.js      Platform-native content
│   │       ├── coder-agent.js       Claude Code + Replit Agent 4
│   │       ├── analyst-agent.js     Data analysis, metrics
│   │       ├── planner-agent.js     Strategy, calendars
│   │       ├── ops-agent.js         Automation, SOP execution
│   │       ├── critic-agent.js      Quality scoring (returns score field)
│   │       ├── learner-agent.js     Pattern extraction
│   │       ├── monitor-agent.js     System health
│   │       ├── synth-agent.js       Synthesis, summaries
│   │       ├── content-agent.js     Social media specialist
│   │       └── publisher-agent.js   Multi-platform publishing
│   │
│   ├── memory/
│   │   ├── memory-manager.js        Unified interface: remember(), recall(), buildContextPacket()
│   │   ├── redis-cache.js           Hot cache, TTL management
│   │   ├── pinecone-store.js        Vector storage, semantic search
│   │   └── pg-store.js              Schema + all structured queries
│   │
│   ├── learning/
│   │   ├── tracker.js               Outcome ring buffer (1000 items)
│   │   ├── scorer.js                Claude-powered quality scoring
│   │   └── optimizer.js             Prompt evolution from top/bottom runs
│   │
│   ├── queue/
│   │   └── task-queue.js            BullMQ setup, priority mapping, stats
│   │
│   ├── content/
│   │   ├── pipeline.js              Master content orchestrator, batch runner
│   │   ├── strategy.js              35-piece weekly calendar via Claude
│   │   ├── image-gen.js             Nano Banana Pro, all platform ratios
│   │   ├── video-gen.js             Kling 2.6, poll until complete, audio-enabled
│   │   └── formatter.js             Platform-specific asset formatting
│   │
│   ├── social/
│   │   ├── publisher.js             Master router, Cowork fallback
│   │   ├── scheduler.js             Cron-based queue, optimal post times
│   │   ├── analytics.js             Post-publish metrics, engagement scoring
│   │   └── platforms/
│   │       ├── tiktok.js            3-step resumable upload flow
│   │       ├── instagram.js         Reels + Posts via Meta Graph
│   │       ├── youtube.js           Shorts + long-form, OAuth refresh
│   │       ├── twitter.js           OAuth 1.0a HMAC-SHA1, tweets + threads
│   │       ├── linkedin.js          UGC API posts
│   │       ├── facebook.js          Page feed, video, image
│   │       └── pinterest.js         Pins + Idea Pins via v5 API
│   │
│   ├── desktop/
│   │   ├── cowork-bridge.js         Anthropic SDK computer_use tool, platform URLs
│   │   └── desktop-tasks.js         Full task library for all 7 platforms
│   │
│   └── api/
│       ├── server.js                Fastify + CORS + WebSocket + all routes
│       └── routes/
│           ├── tasks.js             POST /task, GET /tasks, sync + queued
│           ├── agents.js            GET /agents, /agents/stats
│           ├── content.js           POST /content/campaign, /content/single
│           └── schedule.js          GET /schedule, POST /schedule/post-now
│
└── dashboard/
    ├── package.json
    ├── vite.config.js               Port 5173, proxy /api → :3001
    ├── index.html
    └── src/
        ├── main.jsx
        └── App.jsx                  Full PULSE dashboard (standalone, no imports needed)
```

---

# CONTENT PIPELINE (8 Steps)

1. **Strategy** — Planner agent generates 35-piece weekly calendar. Each item has: id, day, platform, contentType, topic, hook, caption, visualPrompt, videoPrompt, audioNotes, postTime, brandGoal

2. **Copy** — Writer agents (18) produce platform-native captions, hooks, CTAs, hashtags

3. **Image** — Nano Banana Pro generates 4K images. Platform ratios: TikTok 9:16, Instagram Post 1:1, YouTube 16:9, LinkedIn 1.91:1, Pinterest 2:3

4. **Video** — Kling 2.6 animates image → video OR generates from text. Native voiceover + SFX in single API call. Up to 1080p 48fps, 10s clip. Model: `kling-v2-6`, `audio_generation: true`

5. **Review** — Critic agents score quality, brand compliance, platform specs. Must pass threshold to proceed.

6. **Schedule** — Scheduler queues posts at peak times: TikTok 7PM, Instagram 11AM, YouTube 3PM, Twitter 9AM, LinkedIn 8AM, Facebook 1PM, Pinterest 8PM

7. **Publish** — Publisher routes to platform API. On failure → Claude Cowork desktop fallback

8. **Analyse** — Analytics agents collect engagement metrics. Feed performance data back into strategy memory for next cycle.

---

# KEY API DETAILS

## Nano Banana Pro (Image Generation)
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-preview-image-generation" });
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: { responseModalities: ["image"] }
});
```

## Kling 2.6 (Video + Audio)
```javascript
// Text to video
POST https://api.piapi.ai/api/kling/v1/text2video
{
  "model_name": "kling-v2-6",
  "prompt": "...",
  "duration": 10,
  "aspect_ratio": "9:16",
  "audio_generation": true,
  "audio_prompt": "Voiceover description + sound design notes"
}

// Poll for completion
GET https://api.piapi.ai/api/kling/v1/task/{taskId}
// Poll every 8 seconds, timeout 5 minutes
// Status: "pending" | "processing" | "completed" | "failed"
```

## Perplexity Research
```javascript
POST https://api.perplexity.ai/chat/completions
{
  "model": "sonar-pro",
  "messages": [{ "role": "user", "content": query }]
}
```

## Claude Cowork (Desktop Fallback)
```javascript
// Uses Anthropic SDK with computer_use_20241022 tool
const tool = { type: "computer_20241022", name: "computer", display_width_px: 1920, display_height_px: 1080 };
// Navigate to platform URL, upload video/image, fill caption, click publish
```

---

# ENVIRONMENT VARIABLES

```env
# AI Models
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIza...
PIAPI_KEY=...
PERPLEXITY_API_KEY=pplx-...

# Infrastructure
REDIS_URL=redis://localhost:6379
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=nexus-memory
DATABASE_URL=postgresql://postgres:nexuspass@localhost:5432/nexus
PORT=3001
ASSETS_DIR=./assets

# Desktop
COWORK_ENABLED=true

# Social Platforms
TIKTOK_CLIENT_KEY=...
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

# BUILD INSTRUCTIONS

Build in this exact order. Each file must be fully working before moving to the next.

1. `package.json` + `.env.example` + `.gitignore`
2. `src/config.js`
3. `src/memory/` — all 4 files (redis-cache, pinecone-store, pg-store, memory-manager)
4. `src/queue/task-queue.js`
5. `src/learning/` — all 3 files
6. `src/agents/base-agent.js` then `agent-pool.js` then all 12 type files
7. `src/brain/` — router, decomposer, orchestrator
8. `src/content/` — image-gen, video-gen, strategy, formatter, pipeline
9. `src/social/platforms/` — all 7 platform files
10. `src/social/` — analytics, scheduler, publisher
11. `src/desktop/` — both files
12. `src/api/` — routes then server.js
13. `src/index.js`
14. `dashboard/` — vite config, index.html, main.jsx, App.jsx (full PULSE UI)

---

# REAL BUSINESS USE CASES

## Clothing Brand
Product ideation → descriptions → drop calendars → email sequences → launch campaigns → scheduled content → approved auto-posting across all 7 platforms

## Roblox Content
Concept research via Perplexity → hook writing → trailer scripts → thumbnail prompts → content calendars → multi-platform launch distribution

## Build Workflows
PRD creation → code generation via Claude Code + Replit Agent 4 → debugging → deployment coordination → GitHub issue handling

## Content Engine
Research → scripting → asset tracking → Nano Banana Pro images → Kling 2.6 video → queue management → auto-posting → analytics review → strategy improvement loop

---

# SUCCESS CRITERIA

When complete, the following must work:

```bash
# Start NEXUS
npm run dev
# → Boot sequence visible in terminal
# → API running at http://localhost:3001/health returns { status: "online" }
# → Dashboard at http://localhost:5173 shows PULSE UI with animated agent network

# Launch a campaign
curl -X POST http://localhost:3001/content/campaign \
  -H "Content-Type: application/json" \
  -d '{
    "brand": { "name": "My Brand", "niche": "clothing", "visual_style": "dark minimal", "voice_style": "confident" },
    "goals": ["grow followers", "drive sales"],
    "platforms": ["tiktok", "instagram", "youtube"]
  }'
# → Returns campaignId
# → 35 content pieces generated
# → Images created via Nano Banana Pro
# → Videos created via Kling 2.6
# → Posts scheduled at optimal times
# → Auto-published to all platforms

# Submit any task
curl -X POST http://localhost:3001/task/sync \
  -H "Content-Type: application/json" \
  -d '{ "task": "Research top performing TikTok hooks in the streetwear niche this month" }'
# → Research agent uses Perplexity
# → Returns structured findings
# → Stores in memory for future use
```

---

# IMPORTANT RULES

- All files use **ESM** (`import`/`export`) — no CommonJS `require()`
- Node.js 20+ only
- All agent calls use **exponential backoff retry** on 429/529/503
- All Claude calls use `claude-sonnet-4-20250514` for speed (Opus 4 only for orchestrator decisions)
- Memory is written after **every** significant agent action
- The Policy Guard agent **must** intercept High and Critical risk actions
- Kling 2.6 video generation **must** include `audio_generation: true` — this is the key differentiator
- The dashboard chat panel calls the Anthropic API directly from the browser (no backend proxy needed)
- Claude Cowork fallback is triggered automatically when any platform API returns 4xx or 5xx

Build it. Make it real.
