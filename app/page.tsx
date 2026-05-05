"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";

export const theme = {
  background: "#0d1117",
  surface: "#161b22",
  surface2: "#0a0f14",
  border: "#1f2937",
  text: {
    primary: "#d1d5db",
    secondary: "#9ca3af",
    muted: "#6b7280",
    disabled: "#374151",
  },
  primary: {
    main: "#10b981",
    light: "#34d399",
    dark: "#059669",
  },
  status: {
    success: "#34d399",
    error: "#f87171",
    warning: "#fbbf24",
    info: "#60a5fa",
  },
  editor: {
    background: "#0d1117",
    lineHighlight: "#161b22",
    cursor: "#34d399",
    selection: "#264f78",
  },
  terminal: {
    bg: "#0a0f14",
    text: "#9ca3af",
    prompt: "#34d399",
  }
};

const NAV_LINKS = ["Features", "Docs", "GitHub"];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) (e.target as HTMLElement).dataset.visible = "true"; }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}


export default function LandingPage() {
  useReveal();


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
        :root { --mono: 'DM Mono', monospace; --serif: 'DM Serif Display', serif; --sans: 'DM Sans', sans-serif; }
        body { font-family: var(--sans); }
        [data-reveal] { @apply transition-all duration-700 opacity-0 translate-y-7; }
        [data-reveal][data-visible="true"] { @apply opacity-100 translate-y-0; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulsedot { 0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); } 50% { box-shadow: 0 0 0 5px rgba(16,185,129,0); } }
        @keyframes lightTravel { 0% { stroke-dashoffset: 2000; } 100% { stroke-dashoffset: 0; } }
      `}</style>
      <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-300 flex flex-col">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 transition-all duration-300">
        <Link href="#" className="flex items-center gap-2 no-underline">
          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center" style={{ animation: "pulsedot 2.5s ease infinite" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
          </span>
          <span className="font-serif text-lg text-slate-200 font-normal">SyncSpace</span>
        </Link>
        <div className="flex gap-8">
          {NAV_LINKS.map((l) => <Link key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} className="text-xs text-slate-400 no-underline tracking-widest transition-colors duration-150 hover:text-slate-200">{l}</Link>)}
        </div>
        <Link href="#cta" className="inline-block bg-emerald-500 text-black font-sans text-sm font-medium px-4 py-2 rounded transition-all duration-200 hover:bg-emerald-400 hover:shadow-lg">Start coding →</Link>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="none">
          <path d="M 0 200 Q 300 100 600 200 T 1200 200" stroke="rgba(16,185,129,0.3)" strokeWidth="2" fill="none" strokeDasharray="2000" style={{ animation: "lightTravel 15s linear infinite" }} />
          <path d="M 0 400 Q 250 300 500 400 T 1000 450 T 1200 400" stroke="rgba(16,185,129,0.25)" strokeWidth="2" fill="none" strokeDasharray="2000" style={{ animation: "lightTravel 18s linear 1s infinite" }} />
          <path d="M 0 600 Q 200 550 400 600 T 800 620 T 1200 600" stroke="rgba(16,185,129,0.2)" strokeWidth="2" fill="none" strokeDasharray="2000" style={{ animation: "lightTravel 20s linear 2s infinite" }} />
          <path d="M 100 100 Q 400 300 700 150 T 1200 350" stroke="rgba(16,185,129,0.2)" strokeWidth="2" fill="none" strokeDasharray="2000" style={{ animation: "lightTravel 17s linear 1.5s infinite" }} />
          <path d="M 50 650 Q 350 550 650 680 T 1150 700" stroke="rgba(16,185,129,0.15)" strokeWidth="2" fill="none" strokeDasharray="2000" style={{ animation: "lightTravel 22s linear 2.5s infinite" }} />
        </svg>
        <div className="absolute top-2/5 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 pointer-events-none opacity-10" style={{ background: "radial-gradient(ellipse, #10b981 0%, transparent 70%)" }} />
        <div className="absolute top-3/4 left-1/3 w-96 h-96 pointer-events-none opacity-5" style={{ background: "radial-gradient(ellipse, #60a5fa 0%, transparent 70%)" }} />

        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full font-mono text-xs text-emerald-400 tracking-widest mb-8 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" style={{ animation: "blink 2s ease infinite" }} />
          Real-time collaborative code editor
        </div>

        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(3.5rem, 9vw, 7rem)", lineHeight: 0.95, letterSpacing: "-0.02em" }} className="text-slate-100 mb-6 font-normal">
          Code is better<br />
          <em className="italic text-emerald-400">together.</em>
        </h1>

        <p className="max-w-3xl text-base text-slate-400 leading-relaxed font-light mb-12">
          SyncSpace lets your entire team edit the same file simultaneously. Live cursors, instant sync, zero config. Just share a room ID and code.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/editor" className="inline-block bg-emerald-500 text-black font-sans text-sm font-medium px-6 py-3 rounded transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 hover:shadow-lg">Open a room — it's free</Link>
          <Link href="#how-it-works" className="inline-block bg-transparent text-slate-300 font-sans text-sm px-5 py-3 rounded border border-slate-700 transition-all duration-200 hover:border-slate-600 hover:text-slate-100">See how it works ↓</Link>
        </div>
      </section>
    </div>
    </>
  );
}