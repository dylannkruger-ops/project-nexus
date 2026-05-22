# NEXUS AI OS v2.0

> 100-agent autonomous AI system + automated content machine. One central brain that coordinates specialist agents, shared memory, connected tools, automations, approvals, and continuous improvement so it can run real business work 24/7.

## What It Does

- **100 AI Agents** — Research, Writing, Coding, Analytics, Content, Publishing, and more
- **Content Pipeline** — Strategy → Nano Banana Pro (images) → Kling 2.6 (video+audio) → Auto-publish
- **7 Social Platforms** — TikTok, Instagram, YouTube, X, LinkedIn, Facebook, Pinterest
- **Claude Cowork** — Desktop automation fallback if any API fails
- **Infinite Memory** — Redis + Pinecone + PostgreSQL (7 memory types)
- **PULSE Dashboard** — Animated agent network, brain visualization, live feed

## Stack

| Layer | Tech |
|-------|------|
| AI Models | Claude Opus 4 + Sonnet 4 |
| Images | Nano Banana Pro (Gemini 3 Pro) |
| Video | Kling 2.6 (PiAPI) |
| Research | Perplexity API |
| Coding | Claude Code + Replit Agent 4 |
| Desktop | Claude Cowork (MCP) |
| Queue | BullMQ + Redis |
| Memory | Pinecone + PostgreSQL |
| API | Fastify + WebSocket |
| Dashboard | React 18 + Vite |

## Quick Start

```bash
npm install
cp .env.example .env
# Fill in your API keys

# Start infrastructure
docker run -d -p 6379:6379 redis:alpine
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass postgres:16

# Run NEXUS
npm run dev
```

## Launch a Campaign

```bash
curl -X POST http://localhost:3001/content/campaign \
  -H "Content-Type: application/json" \
  -d '{
    "brand": { "name": "Your Brand", "niche": "your niche" },
    "goals": ["grow followers", "drive traffic"],
    "platforms": ["tiktok", "instagram", "youtube", "twitter", "linkedin", "facebook", "pinterest"]
  }'
```

## Architecture

7-layer system: Interface → Brain → Agent → Tool → Automation → Social Connector → Memory/Learning

3 operating modes: Manual, Scheduled, Triggered

4 risk levels: Low (auto) → Medium (auto) → High (approval) → Critical (approval)

## Docs

See `NEXUS-OVERVIEW.md` for the complete system specification and master build prompt.

---

Built with Claude Opus 4 · Perplexity · Kling 2.6 · Nano Banana Pro · Replit Agent 4
