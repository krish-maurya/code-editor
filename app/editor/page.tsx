"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Star {
  x: number; y: number; r: number;
  a: number; da: number; vx: number; vy: number;
}

// ─── Data ───────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Features", "How it works", "Reviews", "Docs", "GitHub"];

const FEATURES = [
  { icon: "⚡", title: "Instant sync", desc: "Every keystroke broadcasts in under 50ms via WebSocket. Operational transforms keep everyone in sync with zero conflicts." },
  { icon: "👁", title: "Live cursors", desc: "See exactly where your teammates are editing. Color-coded cursors per user with name labels. No more 'which line are you on?'" },
  { icon: "🔒", title: "Private rooms", desc: "Share a room ID. Rooms auto-expire. Your code never touches a database — ephemeral by design." },
  { icon: "💬", title: "Inline chat", desc: "Chat without leaving the editor. Conversations are contextual — see messages inline with the code you're discussing." },
  { icon: "🖥", title: "Embedded terminal", desc: "Run your dev server, tests, or scripts inside the editor. Shared output visible to the whole room." },
  { icon: "🌐", title: "No install needed", desc: "Browser-native. No VS Code extension, no sign-up flow, no plugin to install. Open a URL and you're editing." },
];

const STEPS = [
  { num: "01", title: "Open a room", desc: "Enter a username and generate a room ID — or use a link someone shared with you." },
  { num: "02", title: "Share the link", desc: "Send the room ID to your team on Slack, Discord, or anywhere. They join instantly." },
  { num: "03", title: "Code together", desc: "Everyone edits the same file in real time. Live cursors, chat, and a shared terminal." },
];

const REVIEWS = [
  { stars: 5, text: "We replaced screen sharing in code reviews entirely. The live cursor thing alone saved us hours of 'scroll down… no, the other file' conversations.", name: "Priya Mehta", role: "Senior Dev · Vercel", initials: "PM", color: "#00f5a0" },
  { stars: 5, text: "The setup time is zero. I used to dread pair programming sessions because of the tooling friction. SyncSpace removed all of it.", name: "Carlos Vega", role: "Data Engineer · Stripe", initials: "CV", color: "#60a5fa" },
  { stars: 5, text: "Our distributed team across Tokyo, Berlin and Surat finally feel like they're in the same room. The shared terminal is genius.", name: "Yuki Tanaka", role: "ML Engineer · Anthropic", initials: "YT", color: "#fbbf24" },
];

const STATS = [
  { val: "24k+", label: "developers" },
  { val: "<50ms", label: "avg sync latency" },
  { val: "1.2M", label: "sessions started" },
  { val: "99.9%", label: "uptime" },
];

const CODE_LINES = [
  { html: `<span class="text-gray-500 italic">// SyncSpace — Editor.tsx</span>` },
  { html: `<span class="text-pink-400">import</span> <span class="text-blue-300">{ useEffect, useRef, useState }</span> <span class="text-pink-400">from</span> <span class="text-yellow-300">"react"</span>` },
  { html: `<span class="text-pink-400">import</span> <span class="text-blue-300">{ io, Socket }</span> <span class="text-pink-400">from</span> <span class="text-yellow-300">"socket.io-client"</span>` },
  { html: `` },
  { html: `<span class="text-pink-400">interface</span> <span class="text-emerald-400">Props</span> <span class="text-blue-200">{</span> <span class="text-blue-300">roomId</span><span class="text-blue-200">:</span> <span class="text-emerald-400">string</span><span class="text-blue-200">;</span> <span class="text-blue-300">userName</span><span class="text-blue-200">:</span> <span class="text-emerald-400">string</span> <span class="text-blue-200">}</span>` },
  { html: `` },
  { html: `<span class="text-pink-400">export default function</span> <span class="text-yellow-300">Editor</span><span class="text-blue-200">({</span> <span class="text-blue-300">roomId</span><span class="text-blue-200">,</span> <span class="text-blue-300">userName</span> <span class="text-blue-200">}:</span> <span class="text-emerald-400">Props</span><span class="text-blue-200">) {</span>` },
  { html: `  <span class="text-pink-400">const</span> <span class="text-blue-300">socketRef</span> <span class="text-blue-200">=</span> <span class="text-yellow-300">useRef</span><span class="text-blue-200">&lt;</span><span class="text-emerald-400">Socket</span> <span class="text-blue-200">|</span> <span class="text-pink-400">null</span><span class="text-blue-200">&gt;(</span><span class="text-pink-400">null</span><span class="text-blue-200">)</span>` },
  { html: `  <span class="text-pink-400">const</span> <span class="text-blue-200">[</span><span class="text-blue-300">code</span><span class="text-blue-200">,</span> <span class="text-blue-300">setCode</span><span class="text-blue-200">] =</span> <span class="text-yellow-300">useState</span><span class="text-blue-200">(</span><span class="text-yellow-300">""</span><span class="text-blue-200">)</span>` },
  { html: `  <span class="text-pink-400">const</span> <span class="text-blue-200">[</span><span class="text-blue-300">cursors</span><span class="text-blue-200">,</span> <span class="text-blue-300">setCursors</span><span class="text-blue-200">] =</span> <span class="text-yellow-300">useState</span><span class="text-blue-200">({})</span>` },
  { html: `` },
  { html: `  <span class="text-yellow-300">useEffect</span><span class="text-blue-200">(() => {</span>` },
  { html: `    <span class="text-blue-300">socketRef</span><span class="text-blue-200">.</span><span class="text-blue-300">current</span> <span class="text-blue-200">=</span> <span class="text-yellow-300">io</span><span class="text-blue-200">(</span><span class="text-blue-300">process</span><span class="text-blue-200">.</span><span class="text-blue-300">env</span><span class="text-blue-200">.</span><span class="text-emerald-400">WS_URL</span><span class="text-blue-200">!, { </span><span class="text-blue-300">query</span><span class="text-blue-200">: {</span> <span class="text-blue-300">roomId</span><span class="text-blue-200">,</span> <span class="text-blue-300">userName</span> <span class="text-blue-200">} })</span>` },
  { html: `    <span class="text-pink-400">return</span> <span class="text-blue-200">() =></span> <span class="text-blue-300">socketRef</span><span class="text-blue-200">.</span><span class="text-blue-300">current</span><span class="text-blue-200">?.</span><span class="text-yellow-300">disconnect</span><span class="text-blue-200">()</span>` },
  { html: `  <span class="text-blue-200">}, [</span><span class="text-blue-300">roomId</span><span class="text-blue-200">])</span>` },
];

const REMOTE_CURSORS = [
  { name: "Priya", color: "#ff6b9d", top: 148, left: 328 },
  { name: "Carlos", color: "#60a5fa", top: 220, left: 192 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function generateRoomId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return [4, 4, 4]
    .map((n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join(""))
    .join("-");
}

// ─── Hook: reveal on scroll ──────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).dataset.visible = "true"; }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let stars: Star[] = [];
    let W = 0, H = 0, raf = 0;

    function init() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 0.9 + 0.2,
        a: Math.random(), da: (Math.random() - 0.5) * 0.003,
        vx: (Math.random() - 0.5) * 0.07, vy: (Math.random() - 0.5) * 0.07,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach((s) => {
        s.x = (s.x + s.vx + W) % W; s.y = (s.y + s.vy + H) % H;
        s.a = Math.max(0.05, Math.min(1, s.a + s.da));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,216,255,${s.a})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }

    init(); draw();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-50" />;
}

function HeroEditor() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursors, setShowCursors] = useState(false);

  useEffect(() => {
    let i = 0;
    function next() {
      if (i >= CODE_LINES.length) { setTimeout(() => setShowCursors(true), 400); return; }
      setVisibleLines(++i);
      setTimeout(next, i < 4 ? 110 : 160);
    }
    const t = setTimeout(next, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#1a2540] bg-[#0d1526]"
      style={{ boxShadow: "0 40px 120px rgba(0,0,0,.65), 0 0 0 1px rgba(0,245,160,.05)" }}>

      {/* Title bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-white/[.03] border-b border-[#1a2540]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex ml-2">
          {["Editor.tsx", "socket.ts", "utils.ts"].map((t, i) => (
            <div key={t} className={`px-4 py-1 font-mono text-[11px] border-r border-[#1a2540] ${i === 0 ? "text-emerald-400 bg-emerald-400/5" : "text-[#4a5a7a]"}`}>{t}</div>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          {[{ c: "#00f5a0", l: "Y" }, { c: "#ff6b9d", l: "P" }, { c: "#60a5fa", l: "C" }].map((u) => (
            <div key={u.l} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-black" style={{ background: u.c }}>{u.l}</div>
          ))}
        </div>
      </div>

      {/* Code body */}
      <div className="flex" style={{ height: 290 }}>
        {/* Gutter */}
        <div className="w-11 shrink-0 py-4 px-2 text-right font-mono text-[11px] text-[#4a5a7a] leading-[1.8] border-r border-[#1a2540] bg-black/20 select-none">
          {Array.from({ length: visibleLines }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>

        {/* Lines */}
        <div className="flex-1 relative overflow-hidden py-4 px-5 font-mono text-[12px] leading-[1.8]">
          {CODE_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={`block min-h-[1.8em] ${i === 7 ? "bg-blue-500/10 rounded" : ""}`}>
              {line.html
                ? <span dangerouslySetInnerHTML={{ __html: line.html }} />
                : <span>&nbsp;</span>}
              {i === visibleLines - 1 && visibleLines < CODE_LINES.length && (
                <span className="inline-block w-0.5 h-[1em] bg-emerald-400 animate-pulse align-middle ml-0.5" />
              )}
            </div>
          ))}

          {/* Remote cursors */}
          {showCursors && REMOTE_CURSORS.map((cur) => (
            <div key={cur.name} className="absolute" style={{ top: cur.top, left: cur.left }}>
              <div className="w-0.5 h-5 animate-pulse rounded-sm" style={{ background: cur.color }} />
              <div className="absolute -top-5 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-black whitespace-nowrap"
                style={{ background: cur.color }}>{cur.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: string }) {
  return (
    <div data-reveal data-visible="false" className="group relative bg-[#0d1526] border border-[#1a2540] rounded-2xl p-7 overflow-hidden cursor-default
      transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30
      data-[visible=false]:opacity-0 data-[visible=false]:translate-y-8
      data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0"
      style={{ transitionDelay: delay }}>
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="w-11 h-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-xl mb-5">{icon}</div>
        <h3 className="font-bold text-white text-[15px] mb-2 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
        <p className="text-[13px] text-[#4a5a7a] leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );
}

function ReviewCard({ stars, text, name, role, initials, color, delay }: typeof REVIEWS[0] & { delay: string }) {
  return (
    <div data-reveal data-visible="false" className="bg-[#0d1526] border border-[#1a2540] rounded-2xl p-7
      data-[visible=false]:opacity-0 data-[visible=false]:translate-y-8
      data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 transition-all duration-500"
      style={{ transitionDelay: delay }}>
      <div className="text-emerald-400 text-sm tracking-widest mb-4">{"★".repeat(stars)}</div>
      <p className="text-[13.5px] text-[#c8d8f0] leading-relaxed font-light mb-5">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-black shrink-0" style={{ background: color }}>{initials}</div>
        <div>
          <p className="text-[13px] font-medium text-white">{name}</p>
          <p className="text-[11px] text-[#4a5a7a]">{role}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [username, setUsername] = useState("");
  const [roomOut, setRoomOut] = useState("");
  useReveal();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleCreateRoom = useCallback(() => {
    const id = generateRoomId();
    setRoomOut(`Room created: ${id} — share this with your team!`);
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500&display=swap');
        [data-reveal] { transition: opacity .65s ease, transform .65s ease; }
        [data-reveal][data-visible="true"] { opacity: 1 !important; transform: translateY(0) !important; }
        [data-reveal][data-visible="false"] { opacity: 0; transform: translateY(32px); }
      `}</style>

      <div className="relative min-h-screen bg-[#050810] text-[#c8d8f0] overflow-x-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Stars */}
        <StarsCanvas />

        {/* Noise overlay */}
        <div className="fixed inset-0 z-[1] pointer-events-none opacity-30"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E")` }} />

        {/* ── NAV ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 transition-all duration-300 ${scrolled ? "bg-[#050810]/85 backdrop-blur-xl border-b border-[#1a2540]" : ""}`}>
          <a href="#" className="flex items-center gap-2 no-underline" style={{ fontFamily: "'Syne', sans-serif" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: "0 0 0 0 rgba(0,245,160,.4)", animation: "pulse-nav 2s ease-in-out infinite" }} />
            <span className="text-white font-black text-lg tracking-tight">SyncSpace</span>
          </a>
          <div className="hidden md:flex gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                className="text-[13px] text-[#4a5a7a] no-underline hover:text-[#c8d8f0] transition-colors duration-200 tracking-wide">{l}</a>
            ))}
          </div>
          <a href="#cta" className="bg-emerald-400 text-[#050810] text-[13px] font-black px-5 py-2.5 rounded-lg no-underline transition-all duration-200 hover:bg-emerald-300 hover:-translate-y-0.5"
            style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 0 0 0 rgba(0,245,160,0)", transition: "all .2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,245,160,.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
            Start coding →
          </a>
        </nav>

        {/* ── HERO ── */}
        <section className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 text-center">
          {/* Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(0,245,160,.07) 0%, transparent 70%)" }} />
          <div className="absolute top-2/3 left-1/3 w-[350px] h-[350px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(0,179,255,.05) 0%, transparent 70%)" }} />

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-emerald-400/[.06] border border-emerald-400/20 px-4 py-1.5 rounded-full mb-8"
            style={{ fontFamily: "'Fragment Mono', monospace", fontSize: 11, color: "#00f5a0", letterSpacing: ".1em",
              animation: "fadeUp .8s ease both" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Real-time collaborative code editor
          </div>

          {/* Title */}
          <h1 className="text-[clamp(3.5rem,9vw,7.5rem)] font-black leading-[.93] tracking-[-0.04em] text-white mb-6"
            style={{ fontFamily: "'Syne', sans-serif", animation: "fadeUp .8s ease .15s both" }}>
            Code is better<br />
            <span style={{ background: "linear-gradient(135deg, #00f5a0 0%, #00b3ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>together.</span>
            <span className="block" style={{ color: "rgba(255,255,255,.2)", fontStyle: "italic" }}>always.</span>
          </h1>

          {/* Sub */}
          <p className="max-w-lg text-base text-[#4a5a7a] leading-relaxed font-light mb-12"
            style={{ animation: "fadeUp .8s ease .3s both" }}>
            SyncSpace lets your entire team edit the same file simultaneously.
            Live cursors, instant sync, zero config. Just share a room ID and code.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16"
            style={{ animation: "fadeUp .8s ease .45s both" }}>
            <a href="#cta" className="bg-emerald-400 text-[#050810] text-[15px] font-black px-8 py-4 rounded-xl no-underline transition-all duration-200 hover:-translate-y-0.5"
              style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 0 24px rgba(0,245,160,.25)" }}>
              Open a Room — it&apos;s free
            </a>
            <a href="#features" className="border border-[#1a2540] text-[#4a5a7a] text-[14px] font-medium px-7 py-4 rounded-xl no-underline transition-all duration-200 hover:border-white/20 hover:text-[#c8d8f0]">
              See how it works ↓
            </a>
          </div>

          {/* Editor mockup */}
          <div style={{ animation: "fadeUp .8s ease .6s both", width: "100%" }}>
            <HeroEditor />
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <div data-reveal data-visible="false"
          className="relative z-10 flex justify-center border-y border-[#1a2540] bg-black/20">
          {STATS.map((s, i) => (
            <div key={s.label} className={`flex-1 max-w-[220px] py-8 text-center ${i < STATS.length - 1 ? "border-r border-[#1a2540]" : ""}`}>
              <div className="text-[2.2rem] font-black text-white leading-none mb-1 tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                {s.val.replace(/[0-9.]+/, (m) => m)
                  .split(/([\d.<>]+)/)
                  .map((part, j) => /[\d.<>]/.test(part)
                    ? <span key={j} className="text-emerald-400">{part}</span>
                    : <span key={j}>{part}</span>
                  )}
              </div>
              <div className="text-[12px] text-[#4a5a7a] font-light">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── FEATURES ── */}
        <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-28">
          <div data-reveal data-visible="false" className="mb-16">
            <p className="text-[11px] text-emerald-400 tracking-[.18em] uppercase mb-3" style={{ fontFamily: "'Fragment Mono', monospace" }}>// features</p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Everything a team<br />needs to ship.
            </h2>
            <p className="text-[15px] text-[#4a5a7a] max-w-md font-light leading-relaxed">
              Built for speed-obsessed engineers who want to stop screen-sharing and start co-editing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={`${i * 0.08}s`} />
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="relative z-10 py-28 px-6"
          style={{ background: "linear-gradient(180deg, transparent, rgba(0,245,160,.015) 50%, transparent)" }}>
          <div className="max-w-3xl mx-auto text-center">
            <div data-reveal data-visible="false">
              <p className="text-[11px] text-emerald-400 tracking-[.18em] uppercase mb-3" style={{ fontFamily: "'Fragment Mono', monospace" }}>// how it works</p>
              <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight mb-16"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                Up and running in<br />30 seconds.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {/* Connector line */}
              <div className="absolute top-7 left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-px bg-[#1a2540] hidden md:block" />
              {STEPS.map((s, i) => (
                <div key={s.num} data-reveal data-visible="false" className="flex flex-col items-center gap-4"
                  style={{ transitionDelay: `${i * 0.12}s` }}>
                  <div className="w-14 h-14 rounded-full bg-[#0d1526] border border-[#1a2540] flex items-center justify-center relative z-10"
                    style={{ fontFamily: "'Fragment Mono', monospace", fontSize: 13, color: "#00f5a0" }}>{s.num}</div>
                  <h3 className="font-black text-white text-[15px]" style={{ fontFamily: "'Syne', sans-serif" }}>{s.title}</h3>
                  <p className="text-[13px] text-[#4a5a7a] leading-relaxed font-light">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        <section id="reviews" className="relative z-10 max-w-6xl mx-auto px-6 py-28">
          <div data-reveal data-visible="false" className="mb-16">
            <p className="text-[11px] text-emerald-400 tracking-[.18em] uppercase mb-3" style={{ fontFamily: "'Fragment Mono', monospace" }}>// from devs</p>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Teams that use it<br />don&apos;t go back.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <ReviewCard key={r.name} {...r} delay={`${i * 0.1}s`} />
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="cta" className="relative z-10 py-32 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,245,160,.08) 0%, transparent 70%)" }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div data-reveal data-visible="false">
              <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white leading-none tracking-tight mb-4"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                Your team is<br />
                <span className="text-emerald-400">waiting.</span>
              </h2>
              <p className="text-[15px] text-[#4a5a7a] mb-10 font-light">No sign-up. No credit card. Just a room ID.</p>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                  placeholder="Enter username…"
                  className="bg-[#0d1526] border border-[#1a2540] text-[#c8d8f0] text-[13px] px-5 py-3.5 rounded-xl outline-none w-56 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition"
                  style={{ fontFamily: "'Fragment Mono', monospace" }}
                />
                <button onClick={handleCreateRoom}
                  className="bg-emerald-400 text-[#050810] font-black text-[14px] px-7 py-3.5 rounded-xl transition-all duration-200 hover:bg-emerald-300 hover:-translate-y-0.5 cursor-pointer border-none"
                  style={{ fontFamily: "'Syne', sans-serif", boxShadow: "0 8px 32px rgba(0,245,160,.3)" }}>
                  Create a Room →
                </button>
              </div>

              {roomOut && (
                <p className="mt-4 text-[12px] text-emerald-400 animate-pulse" style={{ fontFamily: "'Fragment Mono', monospace" }}>
                  {roomOut}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="relative z-10 border-t border-[#1a2540] px-10 py-7 flex flex-wrap items-center justify-between gap-4">
          <span className="font-black text-[#4a5a7a] text-[14px]" style={{ fontFamily: "'Syne', sans-serif" }}>SyncSpace</span>
          <div className="flex gap-6">
            {["Docs", "GitHub", "Privacy", "Terms"].map((l) => (
              <a key={l} href="#" className="text-[12px] text-[#4a5a7a] no-underline hover:text-[#c8d8f0] transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2" style={{ fontFamily: "'Fragment Mono', monospace", fontSize: 11, color: "#4a5a7a" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </footer>

        {/* Global keyframe styles */}
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse-nav {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0,245,160,.4); }
            50%       { box-shadow: 0 0 0 8px rgba(0,245,160,0); }
          }
        `}</style>
      </div>
    </>
  );
}