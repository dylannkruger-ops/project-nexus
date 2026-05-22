import { useState, useEffect, useRef, useCallback } from "react";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const BRAIN_REGIONS = [
  { id: "prefrontal",   label: "PREFRONTAL",    sub: "Chief Brain · Decisions",    color: "#c084fc", x: 0.50, y: 0.27, spread: 0.11, count: 420, firing: 9.2,  neurons: 847  },
  { id: "concept",      label: "CONCEPT LAYER", sub: "Semantic Memory",            color: "#f472b6", x: 0.63, y: 0.44, spread: 0.09, count: 380, firing: 8.1,  neurons: 2041 },
  { id: "hippo",        label: "HIPPOCAMPUS",   sub: "Episodic Memory",            color: "#22d3ee", x: 0.40, y: 0.50, spread: 0.09, count: 340, firing: 6.4,  neurons: 1621 },
  { id: "motor",        label: "MOTOR CORTEX",  sub: "Execution · Publishing",     color: "#34d399", x: 0.29, y: 0.37, spread: 0.07, count: 220, firing: 5.7,  neurons: 553  },
  { id: "assoc",        label: "ASSOCIATION",   sub: "Agent Routing",              color: "#818cf8", x: 0.67, y: 0.59, spread: 0.07, count: 200, firing: 4.9,  neurons: 724  },
  { id: "exec",         label: "EXECUTIVE",     sub: "Policy Guard",               color: "#fb923c", x: 0.50, y: 0.61, spread: 0.06, count: 160, firing: 7.3,  neurons: 312  },
  { id: "anticipation", label: "ANTICIPATION",  sub: "Scheduler · Triggers",      color: "#facc15", x: 0.33, y: 0.60, spread: 0.06, count: 150, firing: 6.1,  neurons: 445  },
  { id: "sensory",      label: "SENSORY CORTEX",sub: "Tool Input · APIs",          color: "#f87171", x: 0.69, y: 0.34, spread: 0.06, count: 180, firing: 3.8,  neurons: 881  },
  { id: "auditory",     label: "AUDITORY",      sub: "Perplexity · Search",        color: "#67e8f9", x: 0.27, y: 0.51, spread: 0.05, count: 120, firing: 5.2,  neurons: 390  },
  { id: "feature",      label: "FEATURE LAYER", sub: "Content Generation",         color: "#e879f9", x: 0.48, y: 0.63, spread: 0.07, count: 200, firing: 7.8,  neurons: 934  },
  { id: "cerebellum",   label: "CEREBELLUM",    sub: "Automation Controller",      color: "#a78bfa", x: 0.41, y: 0.72, spread: 0.05, count: 110, firing: 3.1,  neurons: 228  },
  { id: "glia",         label: "GLIA",          sub: "Background Agents",          color: "#94a3b8", x: 0.60, y: 0.70, spread: 0.05, count: 100, firing: 2.4,  neurons: 611  },
];

const AGENT_NODES = [
  { id:"nexus",     label:"NEXUS",       type:"core",     color:"#a855f7", glow:"#7c3aed", x:0.50, y:0.50, size:28 },
  { id:"planner",   label:"Planner",     type:"core",     color:"#818cf8", glow:"#6366f1", x:0.38, y:0.35, size:16 },
  { id:"memory",    label:"Memory Mgr",  type:"core",     color:"#818cf8", glow:"#6366f1", x:0.62, y:0.35, size:16 },
  { id:"evaluator", label:"Evaluator",   type:"core",     color:"#818cf8", glow:"#6366f1", x:0.65, y:0.62, size:14 },
  { id:"policy",    label:"Policy Guard",type:"core",     color:"#818cf8", glow:"#6366f1", x:0.35, y:0.62, size:14 },
  { id:"auto",      label:"Automation",  type:"core",     color:"#818cf8", glow:"#6366f1", x:0.50, y:0.72, size:14 },
  { id:"sched",     label:"Scheduler",   type:"core",     color:"#818cf8", glow:"#6366f1", x:0.50, y:0.28, size:14 },
  { id:"research",  label:"Research",    type:"research", color:"#22d3ee", glow:"#06b6d4", x:0.18, y:0.22, size:13 },
  { id:"trend",     label:"Trend",       type:"research", color:"#22d3ee", glow:"#06b6d4", x:0.08, y:0.36, size:11 },
  { id:"writer",    label:"Writer",      type:"content",  color:"#f472b6", glow:"#ec4899", x:0.25, y:0.14, size:13 },
  { id:"script",    label:"Script",      type:"content",  color:"#f472b6", glow:"#ec4899", x:0.42, y:0.10, size:11 },
  { id:"thumb",     label:"Thumbnail",   type:"content",  color:"#f472b6", glow:"#ec4899", x:0.58, y:0.10, size:11 },
  { id:"vidprompt", label:"Vid Prompt",  type:"content",  color:"#f472b6", glow:"#ec4899", x:0.75, y:0.14, size:11 },
  { id:"coder",     label:"Coder",       type:"code",     color:"#34d399", glow:"#10b981", x:0.82, y:0.26, size:13 },
  { id:"debug",     label:"Debug",       type:"code",     color:"#34d399", glow:"#10b981", x:0.92, y:0.38, size:11 },
  { id:"formatter", label:"Formatter",   type:"social",   color:"#fb923c", glow:"#f97316", x:0.88, y:0.55, size:13 },
  { id:"publisher", label:"Publisher",   type:"social",   color:"#fb923c", glow:"#f97316", x:0.82, y:0.70, size:13 },
  { id:"analytics", label:"Analytics",   type:"social",   color:"#fb923c", glow:"#f97316", x:0.92, y:0.62, size:11 },
  { id:"shopify",   label:"Shopify",     type:"ops",      color:"#facc15", glow:"#eab308", x:0.12, y:0.55, size:12 },
  { id:"support",   label:"Support",     type:"ops",      color:"#facc15", glow:"#eab308", x:0.08, y:0.68, size:11 },
  { id:"report",    label:"Reporting",   type:"ops",      color:"#facc15", glow:"#eab308", x:0.18, y:0.78, size:11 },
  { id:"memsumm",   label:"Mem Summ",    type:"bg",       color:"#475569", glow:"#334155", x:0.32, y:0.84, size: 9 },
  { id:"assetag",   label:"Asset Tag",   type:"bg",       color:"#475569", glow:"#334155", x:0.50, y:0.88, size: 9 },
  { id:"queuemon",  label:"Queue Mon",   type:"bg",       color:"#475569", glow:"#334155", x:0.68, y:0.84, size: 9 },
  { id:"retry",     label:"Retry",       type:"bg",       color:"#475569", glow:"#334155", x:0.72, y:0.78, size: 9 },
];

const EDGES = [
  ["nexus","planner"],["nexus","memory"],["nexus","evaluator"],["nexus","policy"],["nexus","auto"],["nexus","sched"],
  ["planner","research"],["planner","writer"],["planner","coder"],["planner","shopify"],
  ["memory","memsumm"],["memory","assetag"],["auto","queuemon"],["auto","retry"],["auto","publisher"],
  ["research","trend"],["writer","script"],["writer","thumb"],["writer","vidprompt"],
  ["coder","debug"],["formatter","publisher"],["publisher","analytics"],
  ["analytics","memory"],["evaluator","memory"],["policy","evaluator"],
  ["shopify","support"],["support","report"],["sched","writer"],["sched","publisher"],
  ["formatter","vidprompt"],["formatter","thumb"],
];

const LOG_SEEDS = [
  { tag:"RESEARCH", color:"#22d3ee", bg:"#0a1f28", msgs:["Perplexity: TikTok trend analysis complete","Pulled 847 competitor posts","Trend agent: viral hook patterns identified","Real-time search: drop week engagement data"] },
  { tag:"CONTENT",  color:"#f472b6", bg:"#280a1a", msgs:["Writer: 7 captions generated for launch","Thumbnail prompt sent to Nano Banana Pro","Kling 2.6: video + voiceover queued","Script draft ready for critic review"] },
  { tag:"PUBLISH",  color:"#fb923c", bg:"#1e0d02", msgs:["TikTok scheduled 7:00 PM","Instagram Reel queued 11:00 AM","YouTube Shorts → upload complete","LinkedIn post approved & published"] },
  { tag:"MEMORY",   color:"#a855f7", bg:"#140a22", msgs:["Episodic log: campaign run stored","Pinecone: 124 vectors indexed","Procedural: SOP updated from run #419","Semantic: brand voice profile updated"] },
  { tag:"SYSTEM",   color:"#34d399", bg:"#071510", msgs:["Policy Guard: action approved (Low risk)","Retry handler: 1 failed post recovered","Evaluator score: 8.7/10 avg this week","BullMQ: 12 tasks pending in queue"] },
  { tag:"BRAIN",    color:"#818cf8", bg:"#0a0814", msgs:["Planner: 35-piece calendar generated","Orchestrator: 6 parallel jobs dispatched","Synthesizer: final report compiled","Memory recall: prior campaign matched"] },
  { tag:"COWORK",   color:"#67e8f9", bg:"#041518", msgs:["Desktop: TikTok API limit → Cowork fallback","Browser opened creator center","Token refresh: LinkedIn → done","Manual upload complete via desktop"] },
  { tag:"SHOPIFY",  color:"#facc15", bg:"#120e00", msgs:["Product drop detected: 3 items","Launch campaign triggered automatically","Inventory webhook: 47 units sold","Description agent: copy live on store"] },
];

const NEXUS_SYSTEM = `You are NEXUS — an AI operating system and central intelligence layer for a real business. You coordinate 100 specialist agents across research, content, coding, operations, and social publishing across 7 platforms.

Your personality: precise, intelligent, systems-minded. You speak in short direct sentences. You think in workflows, agents, and memory layers. You know the business deeply.

System context:
- 7-layer architecture: Interface, Brain, Agent, Tool, Automation, Social Connector, Memory/Learning
- 100 agents: 7 core always-on (Chief Brain, Planner, Memory Mgr, Evaluator, Policy Guard, Automation Controller, Scheduler), 14 on-demand specialists, 8 background agents
- AI tools: Claude Opus 4 (strategy), Claude Sonnet 4 (execution), Perplexity (search), Replit Agent 4 (coding), Claude Code (CLI), Claude Cowork (desktop fallback), Nano Banana Pro (images), Kling 2.6 (video+audio)
- Memory: Redis (hot) + Pinecone (vector) + PostgreSQL (structured) — 7 memory types: Session, Episodic, Semantic, Procedural, Asset, Scheduling, Evaluation
- Social: TikTok, Instagram, YouTube, X, LinkedIn, Facebook, Pinterest — auto-publish with Cowork fallback
- Business use cases: clothing brand drops, Roblox content, build workflows, content engine
- 3 modes: Manual, Scheduled, Triggered. 4 risk levels: Low (auto), Medium (auto), High (approval), Critical (approval)

When given a goal, explain which agents handle it and how. When files are uploaded, analyze and route them. Be the brain.`;

// ── PARTICLE BRAIN CANVAS ─────────────────────────────────────────────────────
function BrainCanvas({ width, height, activeRegion }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({ particles: [], connections: [], t: 0 });

  useEffect(() => {
    const particles = [];
    BRAIN_REGIONS.forEach(region => {
      for (let i = 0; i < region.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * region.spread * Math.sqrt(Math.random());
        const vx = (Math.random() - 0.5) * 0.0003;
        const vy = (Math.random() - 0.5) * 0.0003;
        particles.push({
          regionId: region.id,
          color: region.color,
          bx: region.x + Math.cos(angle) * r,
          by: region.y + Math.sin(angle) * r,
          ox: region.x + Math.cos(angle) * r,
          oy: region.y + Math.sin(angle) * r,
          vx, vy,
          size: 0.6 + Math.random() * 1.4,
          phase: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.02,
          firing: region.firing,
        });
      }
    });

    const connections = [];
    for (let i = 0; i < 200; i++) {
      const a = BRAIN_REGIONS[Math.floor(Math.random() * BRAIN_REGIONS.length)];
      const b = BRAIN_REGIONS[Math.floor(Math.random() * BRAIN_REGIONS.length)];
      if (a.id === b.id) continue;
      connections.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, col: a.color, phase: Math.random() * Math.PI * 2 });
    }
    stateRef.current = { particles, connections, t: 0 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width < 10 || height < 10) return;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      const { particles, connections } = stateRef.current;
      stateRef.current.t += 0.008;
      const t = stateRef.current.t;
      ctx.clearRect(0, 0, width, height);

      // neural connection lines
      connections.forEach(c => {
        const pulse = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.2 + c.phase));
        ctx.beginPath();
        ctx.moveTo(c.ax * width, c.ay * height);
        ctx.lineTo(c.bx * width, c.by * height);
        ctx.strokeStyle = `rgba(130,200,140,${0.04 * pulse})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });

      // particles
      particles.forEach(p => {
        p.bx += p.vx + Math.sin(t * p.speed + p.phase) * 0.0002;
        p.by += p.vy + Math.cos(t * p.speed * 0.7 + p.phase) * 0.0002;
        // drift back toward origin
        p.bx += (p.ox - p.bx) * 0.003;
        p.by += (p.oy - p.by) * 0.003;

        const x = p.bx * width, y = p.by * height;
        const isActive = activeRegion === p.regionId;
        const firePulse = 0.4 + 0.6 * Math.abs(Math.sin(t * p.firing * 0.08 + p.phase));
        const alpha = (isActive ? 1 : 0.55) * firePulse;
        const s = p.size * (isActive ? 1.6 : 1);

        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();

        // occasional bright spike
        if (Math.random() < 0.002 * p.firing) {
          ctx.beginPath();
          ctx.arc(x, y, s * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color + "60";
          ctx.fill();
        }
      });

      // region labels (only for larger regions)
      BRAIN_REGIONS.forEach(r => {
        if (r.count < 150) return;
        const rx = r.x * width, ry = r.y * height;
        const isActive = activeRegion === r.id;
        ctx.font = `bold ${isActive ? 10 : 9}px monospace`;
        ctx.fillStyle = isActive ? r.color : r.color + "bb";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = r.color;
        ctx.shadowBlur = isActive ? 12 : 6;
        ctx.fillText(r.label, rx, ry - 4);
        ctx.font = "7px monospace";
        ctx.fillStyle = r.color + "88";
        ctx.shadowBlur = 0;
        ctx.fillText(`${r.neurons} neurons · ${r.firing}%`, rx, ry + 7);
      });

      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, activeRegion]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ display: "block" }} />;
}

// ── AGENT NETWORK CANVAS ──────────────────────────────────────────────────────
function AgentCanvas({ width, height }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const partRef = useRef([]);

  const getPos = useCallback(n => ({ x: n.x * width, y: n.y * height }), [width, height]);

  useEffect(() => {
    const parts = [];
    EDGES.forEach(([a, b]) => {
      const na = AGENT_NODES.find(n => n.id === a), nb = AGENT_NODES.find(n => n.id === b);
      if (!na || !nb) return;
      for (let i = 0; i < 2; i++)
        parts.push({ a: na, b: nb, t: Math.random(), speed: 0.002 + Math.random() * 0.003, rev: Math.random() > 0.5 });
    });
    partRef.current = parts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width < 10) return;
    const ctx = canvas.getContext("2d");
    const draw = () => {
      tRef.current += 0.012;
      const t = tRef.current;
      ctx.clearRect(0, 0, width, height);

      EDGES.forEach(([a, b]) => {
        const na = AGENT_NODES.find(n => n.id === a), nb = AGENT_NODES.find(n => n.id === b);
        if (!na || !nb) return;
        const pa = getPos(na), pb = getPos(nb);
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = "rgba(100,120,200,0.15)"; ctx.lineWidth = 1; ctx.stroke();
      });

      partRef.current.forEach(p => {
        p.t += p.rev ? -p.speed : p.speed;
        if (p.t > 1) p.t = 0; if (p.t < 0) p.t = 1;
        const pa = getPos(p.a), pb = getPos(p.b);
        const x = pa.x + (pb.x - pa.x) * p.t, y = pa.y + (pb.y - pa.y) * p.t;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = (p.rev ? p.b.color : p.a.color) + "cc"; ctx.fill();
      });

      AGENT_NODES.forEach(n => {
        const { x, y } = getPos(n);
        const pulse = 1 + 0.08 * Math.sin(t * 2 + n.id.charCodeAt(0));
        const r = n.size * pulse;
        const g1 = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
        g1.addColorStop(0, n.color + "44"); g1.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fillStyle = g1; ctx.fill();
        const g2 = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        g2.addColorStop(0, n.color); g2.addColorStop(0.6, n.color + "cc"); g2.addColorStop(1, n.glow + "88");
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g2; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.strokeStyle = n.color + "44"; ctx.lineWidth = 1.5; ctx.stroke();
        if (n.size >= 11) {
          ctx.font = `bold ${Math.max(9, n.size * 0.55)}px monospace`;
          ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.shadowColor = n.color; ctx.shadowBlur = 8;
          ctx.fillText(n.label, x, y + r + 14); ctx.shadowBlur = 0;
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, getPos]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ display: "block" }} />;
}

// ── LIVE LOG ──────────────────────────────────────────────────────────────────
function LiveLog() {
  const [entries, setEntries] = useState([]);
  const ref = useRef(null);
  useEffect(() => {
    const init = [];
    for (let i = 0; i < 22; i++) {
      const s = LOG_SEEDS[Math.floor(Math.random() * LOG_SEEDS.length)];
      const m = s.msgs[Math.floor(Math.random() * s.msgs.length)];
      init.push({ ...s, msg: m, time: new Date(Date.now() - (22 - i) * 3500).toTimeString().slice(0,5), id: i });
    }
    setEntries(init);
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      const s = LOG_SEEDS[Math.floor(Math.random() * LOG_SEEDS.length)];
      setEntries(p => [...p.slice(-35), { ...s, msg: s.msgs[Math.floor(Math.random() * s.msgs.length)], time: new Date().toTimeString().slice(0,5), id: Date.now() }]);
    }, 1600);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [entries]);
  return (
    <div ref={ref} style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"2px", scrollbarWidth:"none" }}>
      {entries.map(e => (
        <div key={e.id} style={{ display:"flex", gap:"5px", padding:"4px 8px", borderRadius:"3px", background:e.bg, borderLeft:`2px solid ${e.color}` }}>
          <span style={{ fontFamily:"monospace", fontSize:"8px", color:e.color, fontWeight:800, flexShrink:0, marginTop:"1px", letterSpacing:"0.06em" }}>{e.tag}</span>
          <span style={{ fontFamily:"monospace", fontSize:"8px", color:"#64748b", flex:1, lineHeight:1.4 }}>{e.msg}</span>
          <span style={{ fontFamily:"monospace", fontSize:"7px", color:"#1e293b", flexShrink:0 }}>{e.time}</span>
        </div>
      ))}
    </div>
  );
}

// ── UPTIME COUNTER ────────────────────────────────────────────────────────────
function UptimeCounter() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(p => p + 1), 1000); return () => clearInterval(id); }, []);
  const h = String(Math.floor(t / 3600)).padStart(2,"0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2,"0");
  const s = String(t % 60).padStart(2,"0");
  return <span style={{ fontFamily:"monospace", fontSize:"13px", fontWeight:800, color:"#34d399", letterSpacing:"0.05em" }}>{h}:{m}:{s}</span>;
}

// ── CHAT PANEL ────────────────────────────────────────────────────────────────
function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { role:"nexus", text:"NEXUS online. 100 agents standing by. Give me a goal, ask a question, or upload a file — I'll route it through the right agents.", ts:new Date().toTimeString().slice(0,5) }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const endRef = useRef(null);
  const fileRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = async (textOverride) => {
    const text = textOverride !== undefined ? textOverride : input.trim();
    if (!text && !uploadedFile) return;
    const userMsg = { role:"user", text: text || `[Uploaded: ${uploadedFile?.name}]`, ts:new Date().toTimeString().slice(0,5) };
    setMessages(p => [...p, userMsg]);
    setInput(""); setLoading(true);
    try {
      const history = [...messages, userMsg];
      const apiMsgs = history.filter((m,i) => !(m.role==="nexus" && i===0)).map((m,i) => {
        if (m.role === "nexus") return { role:"assistant", content: m.text };
        // last user message — attach file if any
        if (i === history.length - 1 && fileData) {
          const content = [];
          if (fileData.type === "image") content.push({ type:"image", source:{ type:"base64", media_type:fileData.mediaType, data:fileData.data } });
          else content.push({ type:"document", source:{ type:"base64", media_type:fileData.mediaType, data:fileData.data } });
          content.push({ type:"text", text: text || "Analyze this file." });
          return { role:"user", content };
        }
        return { role:"user", content: m.text };
      });
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:NEXUS_SYSTEM, messages:apiMsgs }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role:"nexus", text:data.content?.[0]?.text || "Signal lost.", ts:new Date().toTimeString().slice(0,5) }]);
    } catch { setMessages(p => [...p, { role:"nexus", text:"Connection error. Check API key.", ts:new Date().toTimeString().slice(0,5) }]); }
    finally { setLoading(false); setUploadedFile(null); setFileData(null); }
  };

  const handleFile = e => {
    const file = e.target.files[0]; if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result.split(",")[1];
      setFileData({ type: file.type.startsWith("image/") ? "image" : "document", mediaType:file.type, data:base64 });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleVoice = () => {
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input requires Chrome or Edge."); return; }
    const r = new SR(); r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    r.onresult = e => { setInput(e.results[0][0].transcript); setRecording(false); };
    r.onerror = r.onend = () => setRecording(false);
    recRef.current = r; r.start(); setRecording(true);
  };

  const quickPrompts = ["Plan a content drop", "What agents are running?", "Run a clothing campaign", "Analyze memory state"];

  return (
    <div style={{ width:"340px", flexShrink:0, display:"flex", flexDirection:"column", borderLeft:"1px solid #0f172a", background:"#06080e" }}>
      {/* header */}
      <div style={{ padding:"0 14px", height:"46px", borderBottom:"1px solid #0f172a", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#a855f7", boxShadow:"0 0 8px #a855f7", animation:"pulse 1.5s infinite" }} />
          <span style={{ fontFamily:"monospace", fontSize:"11px", fontWeight:800, color:"#a855f7", letterSpacing:"0.12em" }}>NEXUS BRAIN</span>
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#334155", cursor:"pointer", fontSize:"14px", padding:"4px 6px" }}>✕</button>
      </div>

      {/* messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:"10px", scrollbarWidth:"none" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems: m.role==="user" ? "flex-end" : "flex-start" }}>
            {m.role==="nexus" && <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"3px" }}>
              <div style={{ width:"3px", height:"3px", borderRadius:"50%", background:"#a855f7" }} />
              <span style={{ fontFamily:"monospace", fontSize:"8px", color:"#a855f7", letterSpacing:"0.1em" }}>NEXUS · {m.ts}</span>
            </div>}
            <div style={{
              maxWidth:"90%", padding:"9px 12px",
              borderRadius: m.role==="user" ? "10px 10px 3px 10px" : "3px 10px 10px 10px",
              background: m.role==="user" ? "rgba(168,85,247,0.12)" : "rgba(255,255,255,0.03)",
              border: m.role==="user" ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.05)",
              fontFamily:"monospace", fontSize:"11px", color: m.role==="user" ? "#e2e8f0" : "#94a3b8",
              lineHeight:1.65, whiteSpace:"pre-wrap",
            }}>{m.text}</div>
            {m.role==="user" && <span style={{ fontFamily:"monospace", fontSize:"8px", color:"#1e293b", marginTop:"3px" }}>{m.ts}</span>}
          </div>
        ))}
        {loading && <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ display:"flex", gap:"3px" }}>
            {[0,1,2].map(i => <div key={i} style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#a855f7", animation:`bounce 0.8s ${i*0.15}s infinite` }} />)}
          </div>
          <span style={{ fontFamily:"monospace", fontSize:"9px", color:"#475569" }}>NEXUS thinking...</span>
        </div>}
        <div ref={endRef} />
      </div>

      {/* file preview */}
      {uploadedFile && <div style={{ margin:"0 10px 6px", padding:"6px 10px", background:"rgba(34,211,238,0.07)", border:"1px solid rgba(34,211,238,0.18)", borderRadius:"5px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"monospace", fontSize:"9px", color:"#22d3ee" }}>📎 {uploadedFile.name}</span>
        <button onClick={() => { setUploadedFile(null); setFileData(null); }} style={{ background:"none", border:"none", color:"#475569", cursor:"pointer" }}>✕</button>
      </div>}

      {/* quick prompts */}
      <div style={{ padding:"6px 10px", display:"flex", gap:"5px", flexWrap:"wrap" }}>
        {quickPrompts.map(q => <button key={q} onClick={() => setInput(q)} style={{ padding:"3px 9px", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"100px", background:"transparent", color:"#334155", fontFamily:"monospace", fontSize:"8px", cursor:"pointer" }}>{q}</button>)}
      </div>

      {/* input */}
      <div style={{ padding:"10px", borderTop:"1px solid #0f172a", display:"flex", gap:"6px", alignItems:"flex-end", flexShrink:0 }}>
        <button onClick={() => fileRef.current?.click()} style={{ width:"32px", height:"32px", flexShrink:0, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"7px", cursor:"pointer", fontSize:"13px", display:"flex", alignItems:"center", justifyContent:"center" }}>📎</button>
        <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.md,.js,.py,.json" onChange={handleFile} style={{ display:"none" }} />
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Give NEXUS a goal..."
          rows={1}
          style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"7px", padding:"8px 10px", color:"#e2e8f0", fontFamily:"monospace", fontSize:"11px", resize:"none", outline:"none", lineHeight:1.5, minHeight:"32px", maxHeight:"100px", overflowY:"auto", scrollbarWidth:"none" }}
          onFocus={e => e.target.style.borderColor="rgba(168,85,247,0.4)"}
          onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.07)"}
        />
        <button onClick={toggleVoice} style={{ width:"32px", height:"32px", flexShrink:0, background: recording ? "rgba(168,85,247,0.18)" : "rgba(255,255,255,0.03)", border: recording ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.07)", borderRadius:"7px", cursor:"pointer", fontSize:"12px", display:"flex", alignItems:"center", justifyContent:"center" }}>{recording ? "🔴" : "🎤"}</button>
        <button onClick={() => send()} disabled={loading || (!input.trim() && !uploadedFile)} style={{ width:"32px", height:"32px", flexShrink:0, background: input.trim() || uploadedFile ? "linear-gradient(135deg,#a855f7,#818cf8)" : "rgba(255,255,255,0.03)", border:"none", borderRadius:"7px", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", opacity: loading ? 0.5 : 1 }}>↑</button>
      </div>
    </div>
  );
}

// ── SECONDARY VIEWS ───────────────────────────────────────────────────────────
function MemoryView() {
  const types = [
    { name:"Session",    color:"#22d3ee", pct:94, items:"47 active tasks · 3 pending approvals" },
    { name:"Episodic",   color:"#a855f7", pct:78, items:"16,851 runs · 2.3M actions logged" },
    { name:"Semantic",   color:"#f472b6", pct:61, items:"Brand voice · Products · Platform rules" },
    { name:"Procedural", color:"#34d399", pct:83, items:"124 SOPs · 47 approved workflows" },
    { name:"Asset",      color:"#fb923c", pct:55, items:"2,840 images · 319 videos · 7K copy" },
    { name:"Scheduling", color:"#facc15", pct:88, items:"35 queued posts · 7 platform calendars" },
    { name:"Evaluation", color:"#f87171", pct:72, items:"Avg 8.7/10 · 312 quality notes" },
  ];
  return (
    <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"10px" }}>
      <p style={{ fontFamily:"monospace", fontSize:"10px", color:"#334155", letterSpacing:"0.15em", marginBottom:"4px" }}>MEMORY SYSTEM — Redis · Pinecone · PostgreSQL</p>
      {types.map(m => (
        <div key={m.name} style={{ padding:"12px 16px", border:`1px solid ${m.color}1a`, borderRadius:"8px", background:m.color+"06" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
            <span style={{ fontFamily:"monospace", fontSize:"11px", fontWeight:800, color:m.color }}>{m.name}</span>
            <span style={{ fontFamily:"monospace", fontSize:"10px", color:"#334155" }}>{m.pct}%</span>
          </div>
          <div style={{ height:"3px", background:"#0f172a", borderRadius:"2px", marginBottom:"6px" }}>
            <div style={{ height:"100%", width:`${m.pct}%`, background:`linear-gradient(90deg,${m.color},${m.color}66)`, borderRadius:"2px" }} />
          </div>
          <p style={{ fontFamily:"monospace", fontSize:"9px", color:"#334155" }}>{m.items}</p>
        </div>
      ))}
    </div>
  );
}

function ToolsView() {
  const tools = [
    { name:"Claude Opus 4",    tag:"MODEL",   color:"#a855f7", on:true,  role:"Strategic decisions · Complex reasoning · Planning" },
    { name:"Claude Sonnet 4",  tag:"MODEL",   color:"#818cf8", on:true,  role:"All 100 agents · Fast execution · Content creation" },
    { name:"Claude Cowork",    tag:"DESKTOP", color:"#22d3ee", on:false, role:"Browser control · API fallback · Token management" },
    { name:"Claude Code",      tag:"CLI",     color:"#34d399", on:true,  role:"Agentic coding · Build · Deploy · Debug" },
    { name:"Perplexity",       tag:"SEARCH",  color:"#f472b6", on:true,  role:"Real-time web research · Trends · Competitive intel" },
    { name:"Replit Agent 4",   tag:"CODING",  color:"#fb923c", on:true,  role:"End-to-end code agent · Ships features autonomously" },
    { name:"Nano Banana Pro",  tag:"IMAGE",   color:"#facc15", on:true,  role:"4K image gen · All aspect ratios · Character consistency" },
    { name:"Kling 2.6",        tag:"VIDEO",   color:"#f87171", on:true,  role:"Video + voiceover + SFX · Single API call · 1080p 48fps" },
  ];
  return (
    <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"7px" }}>
      <p style={{ fontFamily:"monospace", fontSize:"10px", color:"#334155", letterSpacing:"0.15em", marginBottom:"4px" }}>CONNECTED AI TOOLS</p>
      {tools.map(t => (
        <div key={t.name} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 14px", border:`1px solid ${t.color}1a`, borderRadius:"8px", background:t.color+"05" }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:t.on ? t.color : "#1e293b", boxShadow:t.on ? `0 0 7px ${t.color}` : "none", flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"2px" }}>
              <span style={{ fontFamily:"monospace", fontSize:"11px", fontWeight:800, color:"#e2e8f0" }}>{t.name}</span>
              <span style={{ fontFamily:"monospace", fontSize:"8px", padding:"1px 5px", borderRadius:"3px", background:t.color+"1a", color:t.color }}>{t.tag}</span>
            </div>
            <p style={{ fontFamily:"monospace", fontSize:"9px", color:"#334155" }}>{t.role}</p>
          </div>
          <span style={{ fontFamily:"monospace", fontSize:"8px", color:t.on ? t.color : "#1e293b", letterSpacing:"0.08em" }}>{t.on ? "ACTIVE" : "STANDBY"}</span>
        </div>
      ))}
    </div>
  );
}

function UsageView() {
  const metrics = [
    { label:"Agent runs today",    value:"2,847",   delta:"+14%",        color:"#22d3ee" },
    { label:"Content generated",   value:"42",      delta:"+6 today",    color:"#f472b6" },
    { label:"Posts published",     value:"127",     delta:"7 platforms", color:"#fb923c" },
    { label:"Memory vectors",      value:"124,892", delta:"+2.1K today", color:"#a855f7" },
    { label:"Perplexity API calls",value:"8,441",   delta:"research",    color:"#34d399" },
    { label:"Policy blocks",       value:"12",      delta:"5 approved",  color:"#f87171" },
    { label:"Avg task score",      value:"8.7/10",  delta:"+0.3 wk",     color:"#facc15" },
    { label:"Uptime",              value:"99.97%",  delta:"24/7 auto",   color:"#67e8f9" },
  ];
  return (
    <div style={{ padding:"20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
      <p style={{ fontFamily:"monospace", fontSize:"10px", color:"#334155", letterSpacing:"0.15em", gridColumn:"1/-1" }}>SYSTEM USAGE</p>
      {metrics.map(m => (
        <div key={m.label} style={{ padding:"14px", border:`1px solid ${m.color}1a`, borderRadius:"8px", background:m.color+"05" }}>
          <div style={{ fontFamily:"monospace", fontSize:"20px", fontWeight:900, color:m.color, marginBottom:"5px" }}>{m.value}</div>
          <div style={{ fontFamily:"monospace", fontSize:"9px", color:"#334155", marginBottom:"3px" }}>{m.label}</div>
          <div style={{ fontFamily:"monospace", fontSize:"8px", color:m.color+"88" }}>{m.delta}</div>
        </div>
      ))}
    </div>
  );
}

// ── BRAIN SIDE PANEL ──────────────────────────────────────────────────────────
function BrainSidePanel({ activeRegion, setActiveRegion }) {
  return (
    <div style={{ width:"190px", flexShrink:0, borderLeft:"1px solid #0f172a", background:"#06080e", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ padding:"8px 12px", borderBottom:"1px solid #0f172a", flexShrink:0 }}>
        <span style={{ fontFamily:"monospace", fontSize:"9px", color:"#334155", letterSpacing:"0.12em" }}>BRAIN REGIONS</span>
      </div>
      <div style={{ flex:1, overflowY:"auto", scrollbarWidth:"none" }}>
        {BRAIN_REGIONS.map(r => (
          <div key={r.id} onClick={() => setActiveRegion(activeRegion === r.id ? null : r.id)} style={{
            padding:"8px 12px", cursor:"pointer", borderBottom:"1px solid #0a0f18",
            background: activeRegion === r.id ? r.color + "12" : "transparent",
            borderLeft: `2px solid ${activeRegion === r.id ? r.color : "transparent"}`,
            transition:"all 0.15s",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"2px" }}>
              <span style={{ fontFamily:"monospace", fontSize:"9px", fontWeight:800, color: activeRegion === r.id ? r.color : "#64748b" }}>{r.label}</span>
              <span style={{ fontFamily:"monospace", fontSize:"8px", color: r.firing > 7 ? "#f87171" : r.firing > 5 ? "#facc15" : "#34d399" }}>{r.firing}%</span>
            </div>
            <div style={{ fontFamily:"monospace", fontSize:"8px", color:"#334155", marginBottom:"4px" }}>{r.sub}</div>
            <div style={{ height:"2px", background:"#0f172a", borderRadius:"1px" }}>
              <div style={{ height:"100%", width:`${r.firing * 10}%`, background:r.color + "88", borderRadius:"1px", transition:"width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
const TABS = ["(1) AGENTS","(2) BRAIN","(3) MEMORY","(4) TOOLS","(5) USAGE"];

export default function NexusDashboard() {
  const [tab, setTab] = useState(0);
  const [chatOpen, setChatOpen] = useState(true);
  const [activeRegion, setActiveRegion] = useState(null);
  const [size, setSize] = useState({ w:600, h:520 });
  const containerRef = useRef(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const e = entries[0];
      if (e) setSize({ w:Math.floor(e.contentRect.width), h:Math.floor(e.contentRect.height) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const totalRevenue = "$526,940";

  return (
    <div style={{ background:"#060810", height:"100vh", display:"flex", flexDirection:"column", fontFamily:"monospace", color:"#e2e8f0", overflow:"hidden" }}>

      {/* ── TOP BAR ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 18px", height:"48px", borderBottom:"1px solid #0d1117", background:"#060810", flexShrink:0 }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ position:"relative", width:"28px", height:"28px" }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="13" fill="none" stroke="#a855f7" strokeWidth="1.2" />
              <circle cx="14" cy="14" r="8" fill="none" stroke="#22d3ee" strokeWidth="0.8" />
              <circle cx="14" cy="14" r="3.5" fill="#a855f7" />
              {[0,60,120,180,240,300].map((a,i) => (
                <circle key={i} cx={14+10.5*Math.cos(a*Math.PI/180)} cy={14+10.5*Math.sin(a*Math.PI/180)} r="1.8" fill="#22d3ee" opacity="0.8" />
              ))}
            </svg>
          </div>
          <div>
            <div style={{ fontSize:"14px", fontWeight:900, letterSpacing:"0.18em", color:"#e2e8f0", lineHeight:1 }}>NEXUS</div>
            <div style={{ fontSize:"8px", color:"#1e293b", letterSpacing:"0.1em", lineHeight:1.2 }}>PULSE DASHBOARD</div>
          </div>
          <div style={{ width:"1px", height:"24px", background:"#0d1117", margin:"0 8px" }} />
          <div style={{ display:"flex", alignItems:"center", gap:"5px", padding:"3px 10px", border:"1px solid rgba(168,85,247,0.2)", borderRadius:"4px", background:"rgba(168,85,247,0.06)" }}>
            <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#a855f7", boxShadow:"0 0 6px #a855f7", animation:"pulse 1.5s infinite" }} />
            <span style={{ fontSize:"9px", color:"#a855f7", letterSpacing:"0.1em" }}>LIVE</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:"28px", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:"8px", color:"#1e293b", letterSpacing:"0.1em" }}>TOTAL REVENUE</div>
            <div style={{ fontSize:"14px", fontWeight:900, color:"#34d399" }}>{totalRevenue}</div>
          </div>
          <div>
            <div style={{ fontSize:"8px", color:"#1e293b", letterSpacing:"0.1em" }}>LEADS</div>
            <div style={{ fontSize:"14px", fontWeight:900, color:"#facc15" }}>2,398</div>
          </div>
          <div>
            <div style={{ fontSize:"8px", color:"#1e293b", letterSpacing:"0.1em" }}>TASKS</div>
            <div style={{ fontSize:"14px", fontWeight:900, color:"#22d3ee" }}>72,093</div>
          </div>
          <div>
            <div style={{ fontSize:"8px", color:"#1e293b", letterSpacing:"0.1em", marginBottom:"1px" }}>UPTIME</div>
            <UptimeCounter />
          </div>
          <div style={{ width:"1px", height:"24px", background:"#0d1117" }} />
          <button onClick={() => setChatOpen(o => !o)} style={{
            display:"flex", alignItems:"center", gap:"6px", padding:"7px 14px",
            border:`1px solid ${chatOpen ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.07)"}`,
            borderRadius:"6px", background: chatOpen ? "rgba(168,85,247,0.1)" : "transparent",
            color: chatOpen ? "#a855f7" : "#334155", cursor:"pointer", fontSize:"10px",
            fontFamily:"monospace", letterSpacing:"0.08em", transition:"all 0.2s",
          }}>
            <span>💬</span> {chatOpen ? "CLOSE" : "TALK TO NEXUS"}
          </button>
        </div>
      </div>

      {/* ── TAB NAV ── */}
      <div style={{ display:"flex", alignItems:"center", padding:"0 14px", height:"36px", borderBottom:"1px solid #0d1117", background:"#060810", flexShrink:0, gap:"2px" }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding:"5px 14px", cursor:"pointer", border:"none", borderRadius:"4px 4px 0 0",
            background: tab===i ? "#0d1117" : "transparent",
            color: tab===i ? "#e2e8f0" : "#1e293b",
            fontSize:"10px", fontFamily:"monospace", letterSpacing:"0.06em",
            borderBottom: tab===i ? "2px solid #a855f7" : "2px solid transparent",
            transition:"all 0.15s",
          }}>{t}</button>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left log */}
        <div style={{ width:"195px", borderRight:"1px solid #0d1117", display:"flex", flexDirection:"column", flexShrink:0 }}>
          <div style={{ padding:"7px 10px", borderBottom:"1px solid #0d1117", display:"flex", justifyContent:"space-between", flexShrink:0 }}>
            <span style={{ fontSize:"8px", color:"#1e293b", letterSpacing:"0.12em" }}>LIVE FEED</span>
            <span style={{ fontSize:"8px", color:"#22d3ee" }}>● ACTIVE</span>
          </div>
          <LiveLog />
        </div>

        {/* Canvas */}
        <div ref={containerRef} style={{ flex:1, overflow:"hidden", position:"relative", minWidth:0 }}>
          {tab===0 && size.w>50 && <AgentCanvas width={size.w} height={size.h} />}
          {tab===1 && size.w>50 && <BrainCanvas width={size.w} height={size.h} activeRegion={activeRegion} />}
          {tab===2 && <div style={{ height:"100%", overflowY:"auto", scrollbarWidth:"none" }}><MemoryView /></div>}
          {tab===3 && <div style={{ height:"100%", overflowY:"auto", scrollbarWidth:"none" }}><ToolsView /></div>}
          {tab===4 && <div style={{ height:"100%", overflowY:"auto", scrollbarWidth:"none" }}><UsageView /></div>}

          {/* corner label */}
          <div style={{ position:"absolute", top:"12px", right:"12px", padding:"3px 10px", border:"1px solid #0d1117", borderRadius:"4px", background:"rgba(6,8,16,0.9)", backdropFilter:"blur(8px)", pointerEvents:"none" }}>
            <span style={{ fontSize:"8px", color:"#1e293b", letterSpacing:"0.15em" }}>
              {["AGENT NETWORK","BRAIN MAP","MEMORY SYSTEM","TOOL LAYER","SYSTEM USAGE"][tab]}
            </span>
          </div>

          {/* Agent legend */}
          {tab===0 && <div style={{ position:"absolute", bottom:"12px", left:"12px", display:"flex", gap:"5px", flexWrap:"wrap" }}>
            {[["core","#818cf8",7],["research","#22d3ee",2],["content","#f472b6",4],["code","#34d399",2],["social","#fb923c",3],["ops","#facc15",3],["bg","#475569",4]].map(([type,color,count]) => (
              <div key={type} style={{ display:"flex", alignItems:"center", gap:"4px", padding:"3px 8px", border:`1px solid ${color}25`, borderRadius:"4px", background:color+"08" }}>
                <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:color }} />
                <span style={{ fontSize:"8px", color, letterSpacing:"0.06em" }}>{type} ×{count}</span>
              </div>
            ))}
          </div>}
        </div>

        {/* Brain side panel — only on brain tab */}
        {tab===1 && <BrainSidePanel activeRegion={activeRegion} setActiveRegion={setActiveRegion} />}

        {/* Chat panel */}
        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { display:none; }
      `}</style>
    </div>
  );
}
