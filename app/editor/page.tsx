"use client";

import { useEffect, useState, useRef } from "react";

// ─── ASCII Art Frames ────────────────────────────────────────────────────────
// Frame 0: Two hands apart
// Frame 1: Hands moving closer
// Frame 2: Hands nearly touching
// Frame 3: Hands touching / high-five
// Frame 4: Hands overlapping → becomes keyboard / code

const FRAMES = [
  // Frame 0 – Two hands far apart
  `
    ██╗  ██╗██╗              ██╗  ██╗██╗
    ██║  ██║██║              ██║  ██║██║
    ███████║██║              ███████║██║
    ██╔══██║██║              ██╔══██║██║
    ██║  ██║██║              ██║  ██║██║
    ╚═╝  ╚═╝╚═╝              ╚═╝  ╚═╝╚═╝
  ██████╗ ██████╗          ██████╗ ██████╗ 
  ██╔══██╗██╔══██╗        ██╔══██╗██╔══██╗
  ██║  ██║██████╔╝        ██║  ██║██████╔╝
  ██║  ██║██╔══██╗        ██║  ██║██╔══██╗
  ██████╔╝██║  ██║        ╚█████╔╝██║  ██║
  ╚═════╝ ╚═╝  ╚═╝         ╚════╝ ╚═╝  ╚═╝`,

  // Frame 1 – Moving closer
  `
    ██╗  ██╗██╗          ██╗  ██╗██╗
    ██║  ██║██║          ██║  ██║██║
    ███████║██║          ███████║██║
    ██╔══██║██║          ██╔══██║██║
    ██║  ██║██║          ██║  ██║██║
    ╚═╝  ╚═╝╚═╝          ╚═╝  ╚═╝╚═╝
  ██████╗ ██████╗        ██████╗ ██████╗ 
  ██╔══██╗██╔══██╗      ██╔══██╗██╔══██╗
  ██║  ██║██████╔╝      ██║  ██║██████╔╝
  ██║  ██║██╔══██╗      ██║  ██║██╔══██╗
  ██████╔╝██║  ██║      ╚█████╔╝██║  ██║
  ╚═════╝ ╚═╝  ╚═╝       ╚════╝ ╚═╝  ╚═╝`,

  // Frame 2 – Almost touching
  `
    ██╗  ██╗██╗       ██╗  ██╗██╗
    ██║  ██║██║       ██║  ██║██║
    ███████║██║       ███████║██║
    ██╔══██║██║       ██╔══██║██║
    ██║  ██║██║       ██║  ██║██║
    ╚═╝  ╚═╝╚═╝       ╚═╝  ╚═╝╚═╝
  ██████╗ ██████╗     ██████╗ ██████╗ 
  ██╔══██╗██╔══██╗   ██╔══██╗██╔══██╗
  ██║  ██║██████╔╝   ██║  ██║██████╔╝
  ██║  ██║██╔══██╗   ██║  ██║██╔══██╗
  ██████╔╝██║  ██║   ╚█████╔╝██║  ██║
  ╚═════╝ ╚═╝  ╚═╝    ╚════╝ ╚═╝  ╚═╝`,

  // Frame 3 – HIGH FIVE / TOUCHING
  `
    ██╗  ██╗██╗   ██╗  ██╗██╗
    ██║  ██║██║   ██║  ██║██║
    ███████║██║   ███████║██║
    ██╔══██║██║   ██╔══██║██║
    ██║  ██║██║   ██║  ██║██║
    ╚═╝  ╚═╝╚═╝   ╚═╝  ╚═╝╚═╝
  ██████╗ ██████╗██████╗ ██████╗ 
  ██╔══██╗██╔══████╔══██╗██╔══██╗
  ██║  ██║██████╔██║  ██║██████╔╝
  ██║  ██║██╔══████║  ██║██╔══██╗
  ██████╔╝██║  ████████╔╝██║  ██║
  ╚═════╝ ╚═╝  ╚╚═════╝ ╚═╝  ╚═╝`,

  // Frame 4 – Transforms into keyboard / code logo
  `
  ░██████╗██╗   ██╗███╗   ██╗ ██████╗
  ██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
  ╚█████╗  ╚████╔╝ ██╔██╗ ██║██║
   ╚═══██╗  ╚██╔╝  ██║╚██╗██║██║
  ██████╔╝   ██║   ██║ ╚████║╚██████╗
  ╚═════╝    ╚═╝   ╚═╝  ╚═══╝ ╚═════╝
  ██████╗ ██████╗  █████╗  ██████╗███████╗
  ██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝
  ╚█████╗ ██████╔╝███████║██║     █████╗
   ╚═══██╗██╔═══╝ ██╔══██║██║     ██╔══╝
  ██████╔╝██║     ██║  ██║╚██████╗███████╗
  ╚═════╝ ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝`,
];

const FRAME_COLORS = [
  "text-emerald-500",
  "text-emerald-400",
  "text-emerald-300",
  "text-white",
  "text-emerald-400",
];

const FRAME_GLOWS = [
  "drop-shadow(0 0 8px #10b981)",
  "drop-shadow(0 0 12px #34d399)",
  "drop-shadow(0 0 18px #6ee7b7)",
  "drop-shadow(0 0 28px #ffffff) drop-shadow(0 0 50px #34d399)",
  "drop-shadow(0 0 16px #34d399)",
];

const FLASH_FRAME = 3; // which frame triggers the flash

// ─── Typewriter lines ────────────────────────────────────────────────────────
const TYPEWRITER_LINES = [
  "// real-time collaborative coding",
  "// multiple cursors. one codebase.",
  "// build together. ship faster.",
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [frame, setFrame]           = useState(0);
  const [flash, setFlash]           = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [typedLine, setTypedLine]   = useState(0);
  const [typedText, setTypedText]   = useState("");
  const [doneTyping, setDoneTyping] = useState(false);
  const [scanLine, setScanLine]     = useState(0);
  const animDone = useRef(false);

  // ── ASCII animation sequence ──
  useEffect(() => {
    if (animDone.current) return;
    const delays = [0, 600, 1100, 1500, 2200];
    const timers: ReturnType<typeof setTimeout>[] = [];

    delays.forEach((delay, i) => {
      timers.push(
        setTimeout(() => {
          setFrame(i);
          if (i === FLASH_FRAME) {
            setFlash(true);
            setTimeout(() => setFlash(false), 350);
          }
          if (i === delays.length - 1) {
            setTimeout(() => { setShowContent(true); animDone.current = true; }, 400);
          }
        }, delay)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // ── Typewriter effect ──
  useEffect(() => {
    if (!showContent || doneTyping) return;
    const line = TYPEWRITER_LINES[typedLine];
    if (!line) { setDoneTyping(true); return; }

    let i = typedText.length;
    if (i >= line.length) {
      const t = setTimeout(() => { setTypedLine((p) => p + 1); setTypedText(""); }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTypedText(line.slice(0, i + 1)), 38);
    return () => clearTimeout(t);
  }, [showContent, typedLine, typedText, doneTyping]);

  // ── Scan line effect ──
  useEffect(() => {
    const t = setInterval(() => setScanLine((p) => (p + 1) % 100), 30);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="min-h-screen bg-[#060a0f] text-gray-300 overflow-hidden relative flex flex-col"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>

      {/* ── Google Font ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Syne:wght@700;800&display=swap');

        @keyframes flicker { 0%,100%{opacity:1} 50%{opacity:.92} 75%{opacity:.97} }
        @keyframes scanmove { from{top:0} to{top:100%} }
        @keyframes fadeup { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes grain {
          0%,100%{transform:translate(0,0)}
          10%{transform:translate(-2%,-3%)}
          20%{transform:translate(3%,1%)}
          30%{transform:translate(-1%,4%)}
          40%{transform:translate(2%,-2%)}
          50%{transform:translate(-3%,3%)}
          60%{transform:translate(1%,-4%)}
          70%{transform:translate(3%,2%)}
          80%{transform:translate(-2%,1%)}
          90%{transform:translate(1%,-1%)}
        }
        @keyframes pulse-glow {
          0%,100% { text-shadow: 0 0 10px #34d399, 0 0 20px #34d39960; }
          50%      { text-shadow: 0 0 20px #34d399, 0 0 40px #34d39980, 0 0 60px #34d39930; }
        }
        @keyframes slidein-left  { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slidein-right { from{opacity:0;transform:translateX( 40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pop { 0%{transform:scale(0.9)} 60%{transform:scale(1.04)} 100%{transform:scale(1)} }

        .anim-fadeup   { animation: fadeup .6s ease both; }
        .anim-pop      { animation: pop .5s cubic-bezier(.22,1,.36,1) both; }
        .flicker       { animation: flicker 4s infinite; }
        .blink-cursor  { animation: blink 1s step-end infinite; }
        .glow-pulse    { animation: pulse-glow 2.5s ease-in-out infinite; }
        .slide-left    { animation: slidein-left  .7s cubic-bezier(.22,1,.36,1) both; }
        .slide-right   { animation: slidein-right .7s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      {/* ── CRT scanline overlay ── */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)",
        }} />

      {/* ── Flash on high-five ── */}
      {flash && (
        <div className="fixed inset-0 z-40 bg-white pointer-events-none"
          style={{ opacity: 0.15, transition: "opacity 0.35s" }} />
      )}

      {/* ── Grid background ── */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(52,211,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }} />

      {/* ── Radial glow center ── */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(52,211,153,0.06) 0%, transparent 70%)" }} />

      {/* ── NAV ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-gray-800/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 glow-pulse" />
          <span className="text-emerald-400 text-xs font-bold tracking-[0.25em] uppercase">SyncSpace</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-600">
          {["Docs", "Pricing", "Blog", "GitHub"].map((l) => (
            <a key={l} href="#" className="hover:text-emerald-400 transition">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="text-xs text-gray-500 hover:text-gray-300 transition">Sign in</a>
          <a href="#" className="text-xs bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-4 py-1.5 rounded-lg transition">
            Get started →
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-16 pb-20 text-center">
        {/* Main headline */}
        {showContent && (
          <div className="anim-fadeup" style={{ animationDelay: "0.1s" }}>
            <h1
              className="text-[clamp(2.8rem,7vw,6rem)] font-bold leading-[0.95] tracking-tight text-white mb-6"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Code together,<br />
              <span className="text-emerald-400 glow-pulse">ship faster.</span>
            </h1>
          </div>
        )}

        {showContent && (
          <p className="anim-fadeup text-gray-500 text-base max-w-lg mb-10 leading-relaxed"
            style={{ animationDelay: "0.25s" }}>
            SyncSpace is a real-time collaborative code editor. Share a room ID,
            invite your team, and code together with live cursors, instant sync,
            and zero setup.
          </p>
        )}

        {/* CTA buttons */}
        {showContent && (
          <div className="anim-fadeup flex flex-wrap items-center justify-center gap-4"
            style={{ animationDelay: "0.4s" }}>
            <a href="/join"
              className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm px-7 py-3.5 rounded-xl transition shadow-lg shadow-emerald-900/40 hover:shadow-emerald-600/30 hover:-translate-y-0.5">
              Start a Room →
            </a>
            <a href="/editor"
              className="border border-gray-700 hover:border-emerald-700 text-gray-400 hover:text-emerald-400 font-medium text-sm px-7 py-3.5 rounded-xl transition">
              View Demo
            </a>
          </div>
        )}

        {/* Social proof */}
        {showContent && (
          <div className="anim-fadeup mt-12 flex items-center gap-6 text-xs text-gray-700"
            style={{ animationDelay: "0.55s" }}>
            <span>No account needed</span>
            <span className="text-gray-800">·</span>
            <span>Works in the browser</span>
            <span className="text-gray-800">·</span>
            <span>Open source</span>
          </div>
        )}
      </section>

      {/* ── FEATURES ── */}
      {showContent && (
        <section className="relative z-10 border-t border-gray-800/60 px-8 py-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "⌨",
                title: "Live Cursors",
                desc: "See every teammate's cursor in real-time. Color-coded per user. No lag.",
                delay: "0s",
              },
              {
                icon: "⚡",
                title: "Instant Sync",
                desc: "Every keystroke broadcasts via WebSocket. Zero-conflict operational transforms.",
                delay: "0.1s",
              },
              {
                icon: "🔒",
                title: "Private Rooms",
                desc: "Share a room ID with your team. Rooms expire. Your code stays yours.",
                delay: "0.2s",
              },
            ].map((f) => (
              <div key={f.title}
                className="anim-fadeup bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-emerald-900 transition"
                style={{ animationDelay: f.delay }}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-white font-bold text-sm mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>
                  {f.title}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      {showContent && (
        <footer className="relative z-10 border-t border-gray-800/60 px-8 py-6 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SyncSpace · All systems operational</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition">Privacy</a>
            <a href="#" className="hover:text-gray-400 transition">Terms</a>
            <a href="#" className="hover:text-gray-400 transition">GitHub</a>
          </div>
        </footer>
      )}
    </main>
  );
}