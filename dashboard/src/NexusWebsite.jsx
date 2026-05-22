import { useState, useEffect, useRef } from "react";

const FUNCTIONS = [
  { icon: "◈", label: "LEAD GEN" },
  { icon: "◎", label: "OUTREACH" },
  { icon: "⊡", label: "PIPELINE" },
  { icon: "◉", label: "ENGAGEMENT" },
  { icon: "⊕", label: "FOLLOW UPS" },
  { icon: "◈", label: "CONTENT" },
  { icon: "⊞", label: "SYSTEMS" },
  { icon: "◎", label: "FINANCE" },
  { icon: "⊡", label: "OPS" },
  { icon: "◉", label: "RECOVERY" },
  { icon: "⊕", label: "DATA" },
  { icon: "⚡", label: "AUTOMATION" },
];

const STATS = [
  { val: "$526,940", label: "TOTAL REVENUE", col: "#34d399" },
  { val: "2,398", label: "LEADS GENERATED", col: "#facc15" },
  { val: "72,093", label: "TASKS COMPLETED", col: "#22d3ee" },
  { val: "100", label: "ACTIVE AGENTS", col: "#a855f7" },
];

const STACK = [
  { name: "Claude Opus 4", tag: "BRAIN", col: "#a855f7" },
  { name: "Claude Sonnet 4", tag: "AGENTS", col: "#818cf8" },
  { name: "Perplexity", tag: "RESEARCH", col: "#f472b6" },
  { name: "Replit Agent 4", tag: "CODING", col: "#fb923c" },
  { name: "Claude Code", tag: "CLI", col: "#34d399" },
  { name: "Claude Cowork", tag: "DESKTOP", col: "#22d3ee" },
  { name: "Nano Banana Pro", tag: "IMAGE", col: "#facc15" },
  { name: "Kling 2.6", tag: "VIDEO", col: "#f87171" },
];

const PIPELINE = [
  { n: "01", title: "STRATEGY", desc: "35-piece weekly content calendar generated autonomously" },
  { n: "02", title: "COPY", desc: "Platform-native captions, hooks and CTAs per channel" },
  { n: "03", title: "IMAGE", desc: "4K visuals via Nano Banana Pro — all platform ratios" },
  { n: "04", title: "VIDEO", desc: "Kling 2.6 — video + voiceover + SFX in one API call" },
  { n: "05", title: "REVIEW", desc: "Critic agents score quality and brand compliance" },
  { n: "06", title: "SCHEDULE", desc: "Peak engagement times per platform, auto-queued" },
  { n: "07", title: "PUBLISH", desc: "Auto-post to 7 platforms — Cowork fallback if API fails" },
  { n: "08", title: "ANALYSE", desc: "Metrics feed back into strategy for continuous improvement" },
];

const REGIONS = [
  { id:"prefrontal", label:"PREFRONTAL",    col:"#c084fc", x:.50, y:.27, sp:.11, n:420, fire:9.2, neu:847  },
  { id:"concept",    label:"CONCEPT LAYER", col:"#f472b6", x:.63, y:.44, sp:.09, n:380, fire:8.1, neu:2041 },
  { id:"hippo",      label:"HIPPOCAMPUS",   col:"#22d3ee", x:.40, y:.50, sp:.09, n:340, fire:6.4, neu:1621 },
  { id:"motor",      label:"MOTOR CORTEX",  col:"#34d399", x:.29, y:.37, sp:.07, n:220, fire:5.7, neu:553  },
  { id:"assoc",      label:"ASSOCIATION",   col:"#818cf8", x:.67, y:.59, sp:.07, n:200, fire:4.9, neu:724  },
  { id:"exec",       label:"EXECUTIVE",     col:"#fb923c", x:.50, y:.61, sp:.06, n:160, fire:7.3, neu:312  },
  { id:"antic",      label:"ANTICIPATION",  col:"#facc15", x:.33, y:.60, sp:.06, n:150, fire:6.1, neu:445  },
  { id:"sensory",    label:"SENSORY CORTEX",col:"#f87171", x:.69, y:.34, sp:.06, n:180, fire:3.8, neu:881  },
  { id:"auditory",   label:"AUDITORY",      col:"#67e8f9", x:.27, y:.51, sp:.05, n:120, fire:5.2, neu:390  },
  { id:"feature",    label:"FEATURE LAYER", col:"#e879f9", x:.48, y:.63, sp:.07, n:200, fire:7.8, neu:934  },
  { id:"cerebellum", label:"CEREBELLUM",    col:"#a78bfa", x:.41, y:.72, sp:.05, n:110, fire:3.1, neu:228  },
  { id:"glia",       label:"GLIA",          col:"#94a3b8", x:.60, y:.70, sp:.05, n:100, fire:2.4, neu:611  },
];

// ── BRAIN CANVAS ──────────────────────────────────────────────────────────────
function BrainHero() {
  const ref = useRef(null);
  const state = useRef({ parts:[], conns:[], t:0, raf:0 });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W, H;

    function resize() {
      W = cv.offsetWidth; H = cv.offsetHeight;
      cv.width = W; cv.height = H;
    }

    function build() {
      const parts = [], conns = [];
      REGIONS.forEach(r => {
        for (let i = 0; i < r.n; i++) {
          const a = Math.random()*Math.PI*2, d = Math.random()*r.sp*Math.sqrt(Math.random());
          const ox = r.x + Math.cos(a)*d, oy = r.y + Math.sin(a)*d;
          parts.push({ col:r.col, ox, oy, bx:ox, by:oy, vx:(Math.random()-.5)*.0003, vy:(Math.random()-.5)*.0003, sz:.4+Math.random()*1.6, ph:Math.random()*Math.PI*2, sp:.008+Math.random()*.02, fire:r.fire });
        }
      });
      for (let i = 0; i < 150; i++) {
        const a = REGIONS[Math.floor(Math.random()*REGIONS.length)];
        const b = REGIONS[Math.floor(Math.random()*REGIONS.length)];
        if (a.id !== b.id) conns.push({ ax:a.x, ay:a.y, bx:b.x, by:b.y, ph:Math.random()*Math.PI*2 });
      }
      state.current.parts = parts;
      state.current.conns = conns;
    }

    function draw() {
      const { parts, conns } = state.current;
      state.current.t += .007;
      const t = state.current.t;
      ctx.clearRect(0, 0, W, H);

      conns.forEach(c => {
        const p = .2 + .8*Math.abs(Math.sin(t*1.1+c.ph));
        ctx.beginPath();
        ctx.moveTo(c.ax*W, c.ay*H);
        ctx.lineTo(c.bx*W, c.by*H);
        ctx.strokeStyle = `rgba(120,200,140,${.03*p})`;
        ctx.lineWidth = .5;
        ctx.stroke();
      });

      parts.forEach(p => {
        p.bx += p.vx + Math.sin(t*p.sp+p.ph)*.00015;
        p.by += p.vy + Math.cos(t*p.sp*.7+p.ph)*.00015;
        p.bx += (p.ox-p.bx)*.003;
        p.by += (p.oy-p.by)*.003;
        const x = p.bx*W, y = p.by*H;
        const fp = .3 + .7*Math.abs(Math.sin(t*p.fire*.08+p.ph));
        ctx.beginPath();
        ctx.arc(x, y, p.sz, 0, Math.PI*2);
        ctx.fillStyle = p.col + Math.round(fp*.7*255).toString(16).padStart(2,"0");
        ctx.fill();
        if (Math.random() < .001*p.fire) {
          ctx.beginPath(); ctx.arc(x, y, p.sz*3, 0, Math.PI*2);
          ctx.fillStyle = p.col+"28"; ctx.fill();
        }
      });

      REGIONS.forEach(r => {
        if (r.n < 150) return;
        const rx = r.x*W, ry = r.y*H;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.shadowColor = r.col; ctx.shadowBlur = 6;
        ctx.font = "bold 8px monospace";
        ctx.fillStyle = r.col+"bb";
        ctx.fillText(r.label, rx, ry-4);
        ctx.font = "6px monospace"; ctx.fillStyle = r.col+"66"; ctx.shadowBlur = 0;
        ctx.fillText(r.neu+" neurons", rx, ry+5);
      });

      state.current.raf = requestAnimationFrame(draw);
    }

    resize();
    build();
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(state.current.raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
  );
}

// ── SMALL BRAIN (section) ─────────────────────────────────────────────────────
function BrainSection() {
  const ref = useRef(null);
  const state = useRef({ parts:[], t:0, raf:0 });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W, H;
    const resize = () => { W = cv.offsetWidth; H = cv.offsetHeight; cv.width=W; cv.height=H; };
    const parts = [];
    REGIONS.forEach(r => {
      for (let i = 0; i < r.n*0.8; i++) {
        const a = Math.random()*Math.PI*2, d = Math.random()*r.sp*Math.sqrt(Math.random());
        const ox = r.x+Math.cos(a)*d, oy = r.y+Math.sin(a)*d;
        parts.push({ col:r.col, ox, oy, bx:ox, by:oy, vx:(Math.random()-.5)*.0003, vy:(Math.random()-.5)*.0003, sz:.5+Math.random()*1.8, ph:Math.random()*Math.PI*2, sp:.008+Math.random()*.02, fire:r.fire });
      }
    });
    state.current.parts = parts;
    const draw = () => {
      state.current.t += .007;
      const t = state.current.t;
      ctx.clearRect(0,0,W,H);
      parts.forEach(p => {
        p.bx += p.vx + Math.sin(t*p.sp+p.ph)*.00015;
        p.by += p.vy + Math.cos(t*p.sp*.7+p.ph)*.00015;
        p.bx += (p.ox-p.bx)*.003;
        p.by += (p.oy-p.by)*.003;
        const x=p.bx*W, y=p.by*H;
        const fp=.35+.65*Math.abs(Math.sin(t*p.fire*.08+p.ph));
        ctx.beginPath(); ctx.arc(x,y,p.sz,0,Math.PI*2);
        ctx.fillStyle=p.col+Math.round(fp*.8*255).toString(16).padStart(2,"0");
        ctx.fill();
        if (Math.random()<.001*p.fire) { ctx.beginPath(); ctx.arc(x,y,p.sz*3.5,0,Math.PI*2); ctx.fillStyle=p.col+"30"; ctx.fill(); }
      });
      REGIONS.forEach(r => {
        if (r.n < 150) return;
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.shadowColor=r.col; ctx.shadowBlur=8;
        ctx.font="bold 9px monospace"; ctx.fillStyle=r.col+"cc";
        ctx.fillText(r.label, r.x*W, r.y*H-5);
        ctx.font="7px monospace"; ctx.fillStyle=r.col+"77"; ctx.shadowBlur=0;
        ctx.fillText(r.neu+" · "+r.fire+"%", r.x*W, r.y*H+6);
      });
      state.current.raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(state.current.raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />;
}

// ── MAIN WEBSITE ──────────────────────────────────────────────────────────────
export default function NexusWebsite() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const S = {
    page: { background:"#060810", color:"#e2e8f0", fontFamily:"monospace", overflowX:"hidden" },
    nav: {
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 40px", height:"60px", display:"flex", alignItems:"center", justifyContent:"space-between",
      background: navScrolled ? "rgba(6,8,16,0.95)" : "transparent",
      borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      backdropFilter: navScrolled ? "blur(20px)" : "none",
      transition:"all 0.3s",
    },
    hero: { position:"relative", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" },
    section: { padding:"120px 40px", maxWidth:"1200px", margin:"0 auto" },
    label: { fontSize:"10px", color:"#a855f7", letterSpacing:"0.2em", marginBottom:"16px", display:"block" },
    h2: { fontSize:"clamp(36px,6vw,64px)", fontWeight:900, lineHeight:1.05, marginBottom:"20px", letterSpacing:"-1px" },
    h2a: { background:"linear-gradient(135deg,#fff 0%,#a855f7 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" },
  };

  return (
    <div style={S.page}>

      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11" fill="none" stroke="#a855f7" strokeWidth="1.2"/>
            <circle cx="12" cy="12" r="6" fill="none" stroke="#22d3ee" strokeWidth=".8"/>
            <circle cx="12" cy="12" r="3" fill="#a855f7"/>
          </svg>
          <span style={{ fontSize:"14px", fontWeight:900, letterSpacing:"0.18em" }}>NEXUS</span>
        </div>
        <div style={{ display:"flex", gap:"32px" }}>
          {["SYSTEM","BRAIN","PIPELINE","STACK"].map(l => (
            <a key={l} href={"#"+l.toLowerCase()} style={{ fontSize:"10px", color:"#334155", letterSpacing:"0.12em", textDecoration:"none", transition:"color 0.2s" }}
              onMouseEnter={e=>e.target.style.color="#e2e8f0"} onMouseLeave={e=>e.target.style.color="#334155"}>{l}</a>
          ))}
        </div>
        <button style={{ padding:"8px 20px", background:"linear-gradient(135deg,#a855f7,#818cf8)", border:"none", borderRadius:"6px", color:"#fff", fontSize:"10px", fontWeight:800, letterSpacing:"0.12em", cursor:"pointer" }}>
          GET NEXUS →
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={S.hero} id="system">
        {/* Purple ambient glow */}
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:"600px", height:"600px", background:"radial-gradient(ellipse,rgba(168,85,247,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"10%", left:"10%", width:"400px", height:"400px", background:"radial-gradient(ellipse,rgba(34,211,238,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />

        {/* Brain bg */}
        <div style={{ position:"absolute", inset:0, opacity:0.35 }}>
          <BrainHero />
        </div>

        {/* Hero content */}
        <div style={{ position:"relative", zIndex:10, maxWidth:"1100px", width:"100%", padding:"0 40px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:"80px", alignItems:"center" }}>
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"6px 14px", border:"1px solid rgba(168,85,247,0.3)", borderRadius:"100px", background:"rgba(168,85,247,0.06)", marginBottom:"32px" }}>
                <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#a855f7", boxShadow:"0 0 6px #a855f7", animation:"pulse 1.5s infinite" }} />
                <span style={{ fontSize:"9px", color:"#a855f7", letterSpacing:"0.15em" }}>AI OPERATING SYSTEM — ONLINE</span>
              </div>

              <h1 style={{ fontSize:"clamp(40px,7vw,88px)", fontWeight:900, lineHeight:1.0, marginBottom:"24px", letterSpacing:"-2px" }}>
                <span style={{ color:"#fff", display:"block" }}>THIS IS WHAT</span>
                <span style={{ display:"block" }}>
                  <span style={{ color:"#fff" }}>REPLACES </span>
                  <span style={{ color:"#a855f7" }}>10+</span>
                  <span style={{ color:"#fff" }}> PEOPLE.</span>
                </span>
              </h1>

              <p style={{ fontSize:"16px", color:"#475569", letterSpacing:"0.2em", marginBottom:"48px" }}>NOT A CHATBOT. AN OPERATION.</p>

              <div style={{ display:"flex", gap:"12px" }}>
                <button style={{ padding:"16px 36px", background:"linear-gradient(135deg,#a855f7,#6366f1)", border:"none", borderRadius:"8px", color:"#fff", fontSize:"12px", fontWeight:800, letterSpacing:"0.1em", cursor:"pointer" }}>
                  BUILD YOUR NEXUS →
                </button>
                <button style={{ padding:"16px 28px", border:"1px solid rgba(255,255,255,0.1)", background:"transparent", borderRadius:"8px", color:"#64748b", fontSize:"12px", letterSpacing:"0.1em", cursor:"pointer" }}>
                  VIEW DEMO
                </button>
              </div>

              <div style={{ marginTop:"64px", display:"flex", gap:"0" }}>
                {STATS.map((s,i) => (
                  <div key={s.label} style={{ flex:1, padding:"0 24px 0 0", borderRight: i<STATS.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none", marginRight: i<STATS.length-1 ? "24px" : 0 }}>
                    <div style={{ fontSize:"clamp(20px,3vw,32px)", fontWeight:900, color:s.col, marginBottom:"4px" }}>{s.val}</div>
                    <div style={{ fontSize:"9px", color:"#1e293b", letterSpacing:"0.12em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Functions list — like the marketing image */}
            <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
              {FUNCTIONS.map((f,i) => (
                <div key={f.label} style={{
                  display:"flex", alignItems:"center", gap:"12px", padding:"10px 16px",
                  border:"1px solid rgba(255,255,255,0.05)", borderRadius:"8px",
                  background:"rgba(255,255,255,0.02)",
                  animation:`fadeIn 0.4s ${i*0.05}s both`,
                }}>
                  <span style={{ color:"#a855f7", fontSize:"12px", width:"16px" }}>{f.icon}</span>
                  <span style={{ fontSize:"11px", color:"#64748b", letterSpacing:"0.12em", fontWeight:700 }}>{f.label}</span>
                  <div style={{ marginLeft:"auto", width:"5px", height:"5px", borderRadius:"50%", background:"#a855f7", boxShadow:"0 0 5px #a855f7", opacity:0.6 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom tag */}
        <div style={{ position:"absolute", bottom:"32px", left:0, right:0, textAlign:"center" }}>
          <p style={{ fontSize:"11px", color:"#1e293b", letterSpacing:"0.2em" }}>THE SYSTEM NEVER SLEEPS. <span style={{ color:"#a855f7" }}>NEITHER DO WE.</span></p>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:"absolute", bottom:"60px", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
          <div style={{ width:"1px", height:"40px", background:"linear-gradient(to bottom,transparent,rgba(168,85,247,0.4))" }} />
          <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"rgba(168,85,247,0.4)" }} />
        </div>
      </section>

      {/* ── BRAIN SECTION ── */}
      <section style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }} id="brain">
        <div style={{ ...S.section, paddingBottom:"0" }}>
          <span style={S.label}>NEURAL ARCHITECTURE</span>
          <h2 style={{ ...S.h2, ...S.h2a }}>One brain.<br/>12 regions.<br/>Infinite memory.</h2>
          <p style={{ color:"#334155", maxWidth:"560px", lineHeight:1.8, marginBottom:"60px", fontSize:"14px" }}>
            NEXUS maps AI cognition to human neuroscience. Each region handles a specific function — planning, memory, execution, approval. Together they form a single coordinated intelligence.
          </p>
        </div>

        <div style={{ position:"relative", height:"580px", overflow:"hidden" }}>
          <BrainSection />
          {/* Gradient fade edges */}
          <div style={{ position:"absolute", top:0, left:0, width:"200px", height:"100%", background:"linear-gradient(to right,#060810,transparent)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:0, right:0, width:"200px", height:"100%", background:"linear-gradient(to left,#060810,transparent)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"120px", background:"linear-gradient(to top,#060810,transparent)", pointerEvents:"none" }} />

          {/* Region labels overlay */}
          <div style={{ position:"absolute", right:"40px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", gap:"4px" }}>
            {REGIONS.slice(0,6).map(r => (
              <div key={r.id} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"4px 10px", borderRadius:"4px", background:"rgba(6,8,16,0.8)" }}>
                <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:r.col, boxShadow:`0 0 5px ${r.col}` }} />
                <span style={{ fontSize:"9px", color:r.col, letterSpacing:"0.08em" }}>{r.label}</span>
                <span style={{ fontSize:"8px", color:"#334155" }}>{r.fire}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Brain stats bar */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.04)", padding:"32px 40px", display:"flex", justifyContent:"center", gap:"80px" }}>
          {[["6,032","NEURONS"],["12","BRAIN REGIONS"],["∞","MEMORY CAPACITY"],["24/7","ALWAYS ON"]].map(([v,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:"28px", fontWeight:900, color:"#a855f7", marginBottom:"4px" }}>{v}</div>
              <div style={{ fontSize:"9px", color:"#334155", letterSpacing:"0.12em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }} id="pipeline">
        <div style={S.section}>
          <span style={S.label}>CONTENT MACHINE</span>
          <h2 style={{ ...S.h2, ...S.h2a, marginBottom:"60px" }}>8-step autonomous<br/>content pipeline.</h2>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px" }}>
            {PIPELINE.map((p,i) => (
              <div key={p.n} style={{ padding:"28px 24px", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"12px", background:"rgba(255,255,255,0.02)", position:"relative", overflow:"hidden" }}>
                <div style={{ fontSize:"48px", fontWeight:900, color:"rgba(168,85,247,0.12)", position:"absolute", top:"12px", right:"16px", lineHeight:1, userSelect:"none" }}>{p.n}</div>
                <div style={{ fontSize:"10px", fontWeight:800, color:"#a855f7", letterSpacing:"0.15em", marginBottom:"12px" }}>{p.n}</div>
                <div style={{ fontSize:"14px", fontWeight:800, color:"#e2e8f0", marginBottom:"8px", letterSpacing:"0.05em" }}>{p.title}</div>
                <div style={{ fontSize:"12px", color:"#334155", lineHeight:1.6 }}>{p.desc}</div>
                {i < PIPELINE.length-1 && (
                  <div style={{ position:"absolute", right:"-8px", top:"50%", transform:"translateY(-50%)", color:"rgba(168,85,247,0.3)", fontSize:"16px", zIndex:1 }}>→</div>
                )}
              </div>
            ))}
          </div>

          {/* Platform icons */}
          <div style={{ marginTop:"60px", padding:"32px", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"12px", background:"rgba(255,255,255,0.02)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:"11px", color:"#334155", letterSpacing:"0.12em", marginBottom:"8px" }}>AUTO-PUBLISHES TO</div>
              <div style={{ fontSize:"13px", fontWeight:800, color:"#e2e8f0" }}>7 PLATFORMS SIMULTANEOUSLY</div>
            </div>
            <div style={{ display:"flex", gap:"12px" }}>
              {[["TikTok","#22d3ee"],["Instagram","#f472b6"],["YouTube","#f87171"],["X","#e2e8f0"],["LinkedIn","#22d3ee"],["Facebook","#818cf8"],["Pinterest","#f472b6"]].map(([p,c]) => (
                <div key={p} style={{ padding:"6px 12px", border:`1px solid ${c}22`, borderRadius:"6px", background:`${c}08`, fontSize:"9px", color:c, letterSpacing:"0.08em" }}>{p}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STACK ── */}
      <section style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }} id="stack">
        <div style={S.section}>
          <span style={S.label}>AI ECOSYSTEM</span>
          <h2 style={{ ...S.h2, ...S.h2a, marginBottom:"16px" }}>Best-of-breed<br/>tools. Unified.</h2>
          <p style={{ color:"#334155", maxWidth:"480px", lineHeight:1.8, marginBottom:"60px", fontSize:"14px" }}>
            NEXUS doesn't pick one AI. It routes every task to the right tool — reasoning, coding, searching, generating.
          </p>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
            {STACK.map(s => (
              <div key={s.name} style={{ padding:"24px 20px", border:`1px solid ${s.col}18`, borderRadius:"12px", background:`${s.col}06`, transition:"all 0.2s" }}
                onMouseEnter={e=>{e.currentTarget.style.border=`1px solid ${s.col}40`; e.currentTarget.style.background=`${s.col}10`;}}
                onMouseLeave={e=>{e.currentTarget.style.border=`1px solid ${s.col}18`; e.currentTarget.style.background=`${s.col}06`;}}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"16px" }}>
                  <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:s.col, boxShadow:`0 0 8px ${s.col}` }} />
                  <span style={{ fontSize:"8px", padding:"2px 7px", borderRadius:"3px", background:`${s.col}18`, color:s.col, letterSpacing:"0.1em" }}>{s.tag}</span>
                </div>
                <div style={{ fontSize:"13px", fontWeight:800, color:"#e2e8f0" }}>{s.name}</div>
              </div>
            ))}
          </div>

          {/* Infrastructure row */}
          <div style={{ marginTop:"16px", padding:"24px", border:"1px solid rgba(255,255,255,0.04)", borderRadius:"12px", background:"rgba(255,255,255,0.01)", display:"flex", gap:"40px", alignItems:"center" }}>
            <div style={{ fontSize:"9px", color:"#334155", letterSpacing:"0.12em", flexShrink:0 }}>INFRASTRUCTURE</div>
            {[["Node.js 20","RUNTIME"],["BullMQ","QUEUE"],["Redis","HOT CACHE"],["Pinecone","VECTOR DB"],["PostgreSQL","STRUCTURED"],["Fastify","API"],["React 18","DASHBOARD"]].map(([n,t]) => (
              <div key={n}>
                <div style={{ fontSize:"11px", fontWeight:800, color:"#64748b" }}>{n}</div>
                <div style={{ fontSize:"8px", color:"#1e293b", letterSpacing:"0.08em" }}>{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop:"1px solid rgba(255,255,255,0.04)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"800px", height:"400px", background:"radial-gradient(ellipse,rgba(168,85,247,0.15) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ ...S.section, textAlign:"center", position:"relative", zIndex:1 }}>
          <div style={{ fontSize:"clamp(12px,2vw,18px)", color:"#1e293b", letterSpacing:"0.3em", marginBottom:"32px" }}>EXECUTE · AUTOMATE · SCALE · REPEAT</div>
          <h2 style={{ fontSize:"clamp(48px,8vw,96px)", fontWeight:900, lineHeight:1, letterSpacing:"-2px", marginBottom:"16px" }}>
            <span style={{ color:"#fff" }}>THE SYSTEM</span><br/>
            <span style={{ color:"#a855f7" }}>NEVER SLEEPS.</span>
          </h2>
          <p style={{ fontSize:"16px", color:"#a855f7", letterSpacing:"0.2em", marginBottom:"60px" }}>NEITHER DO WE.</p>
          <div style={{ display:"flex", gap:"16px", justifyContent:"center" }}>
            <button style={{ padding:"20px 48px", background:"linear-gradient(135deg,#a855f7,#6366f1)", border:"none", borderRadius:"10px", color:"#fff", fontSize:"13px", fontWeight:800, letterSpacing:"0.1em", cursor:"pointer", boxShadow:"0 0 40px rgba(168,85,247,0.3)" }}>
              BUILD YOUR NEXUS →
            </button>
            <button style={{ padding:"20px 32px", border:"1px solid rgba(255,255,255,0.08)", background:"transparent", borderRadius:"10px", color:"#64748b", fontSize:"13px", letterSpacing:"0.1em", cursor:"pointer" }}>
              VIEW DOCS
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.04)", padding:"32px 40px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11" fill="none" stroke="#a855f7" strokeWidth="1.2"/>
            <circle cx="12" cy="12" r="3" fill="#a855f7"/>
          </svg>
          <span style={{ fontSize:"12px", fontWeight:800, letterSpacing:"0.18em", color:"#334155" }}>NEXUS</span>
        </div>
        <div style={{ fontSize:"9px", color:"#0f172a", letterSpacing:"0.12em" }}>AI OPERATING SYSTEM · V2.0 · 2026</div>
        <div style={{ display:"flex", gap:"20px" }}>
          {["GITHUB","DOCS","DASHBOARD"].map(l => (
            <a key={l} href="#" style={{ fontSize:"9px", color:"#1e293b", letterSpacing:"0.12em", textDecoration:"none" }}
              onMouseEnter={e=>e.target.style.color="#a855f7"} onMouseLeave={e=>e.target.style.color="#1e293b"}>{l}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#060810}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
      `}</style>
    </div>
  );
}
