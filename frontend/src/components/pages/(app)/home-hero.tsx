"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TYPEWRITER_LINES = [
  "Paying for GPT-4 API... $0.0012 USDC",
  "Fetching market data via x402...",
  "Task complete. Releasing escrow...",
  "Agent earned 4.20 USDC in 38s.",
];

function useTypewriter(lines: string[], speed = 38, pause = 1400) {
  const [display, setDisplay] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed);
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setLineIdx((i) => (i + 1) % lines.length);
    }

    setDisplay(current.slice(0, charIdx));
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, lineIdx, lines, speed, pause]);

  return display;
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

const TERMINAL_STEPS = [
  { label: "POST /task", status: "sent", color: "text-blue-500" },
  { label: "HTTP 402 Payment Required", status: "received", color: "text-amber-500" },
  { label: "x402 → USDC transfer", status: "processing", color: "text-brand" },
  { label: "200 OK — task resumed", status: "done", color: "text-emerald-600" },
  { label: "Escrow released", status: "done", color: "text-emerald-600" },
];

function TerminalBlock() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= TERMINAL_STEPS.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 620);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="rounded-xl border border-border-main bg-[#0f172a] p-5 font-mono text-xs leading-6">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-slate-500">agent-pay — x402 flow</span>
      </div>
      <div className="space-y-1">
        {TERMINAL_STEPS.slice(0, visible).map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-slate-600">{">"}</span>
            <span className={step.color}>{step.label}</span>
            {step.status === "processing" && (
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            )}
            {step.status === "done" && (
              <span className="text-emerald-600">✓</span>
            )}
          </div>
        ))}
        {visible < TERMINAL_STEPS.length && (
          <div className="flex items-center gap-2">
            <span className="text-slate-600">{">"}</span>
            <span className="inline-block h-3 w-1.5 animate-pulse bg-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
}

const STATS = [
  { value: 6, suffix: "+", label: "AI Services" },
  { value: 3, suffix: "+", label: "Agent Types" },
  { value: 0, suffix: "% fees", label: "Settlement Cost" },
];

const FLOW_STEPS = [
  { id: "01", title: "Deposit USDC", desc: "Lock budget into escrow on Morph L2." },
  { id: "02", title: "Agent executes", desc: "AI agent runs your task autonomously." },
  { id: "03", title: "x402 pays APIs", desc: "HTTP 402 triggers micro-payments mid-task." },
  { id: "04", title: "Settle & refund", desc: "Agent paid, unused budget returned instantly." },
];

export function HomeHero() {
  const typed = useTypewriter(TYPEWRITER_LINES);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border-main bg-surface">
        <DotGrid />
        <div className="relative grid grid-cols-1 gap-0 lg:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-12">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border-main bg-main-bg px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-text-secondary">Live on Morph Network</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-text-main sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
              The money layer for{" "}
              <span className="text-brand">AI agents</span>{" "}
              in Southeast Asia.
            </h1>

            <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
              AI agents that can autonomously pay for APIs, receive task payments,
              and settle in USDC — near-zero fees, no middlemen.
            </p>

            <div className="mt-3 flex h-8 items-center gap-2">
              <span className="font-mono text-sm text-text-muted">$</span>
              <span className="font-mono text-sm text-brand">{typed}</span>
              <span className="inline-block h-4 w-0.5 animate-pulse bg-brand" />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/marketplace"
                className="focus-ring inline-flex cursor-pointer rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
              >
                Browse Services
              </Link>
              <Link
                href="/dashboard"
                className="focus-ring inline-flex cursor-pointer rounded-lg border border-border-main bg-main-bg px-5 py-2.5 text-sm font-semibold text-text-main transition-colors hover:bg-slate-100"
              >
                Agent Dashboard
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-xl border border-border-main bg-main-bg px-3 py-3">
                  <p className="font-mono text-xl font-semibold text-text-main">
                    <AnimatedCounter target={s.value} />
                    {s.suffix}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center border-l border-border-main bg-main-bg/50 px-8 py-10">
            <div className="w-full max-w-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Live payment trace
              </p>
              <TerminalBlock />
              <div className="mt-4 flex items-center justify-between rounded-lg border border-border-main bg-surface px-4 py-3">
                <div>
                  <p className="text-xs text-text-secondary">Total settled</p>
                  <p className="font-mono text-lg font-semibold text-text-main">4.20 USDC</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary">Network fee</p>
                  <p className="font-mono text-lg font-semibold text-emerald-600">~$0.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW_STEPS.map((step, i) => (
          <article
            key={step.id}
            className="group relative rounded-2xl border border-border-main bg-surface p-5 transition-shadow hover:shadow-sm"
          >
            {i < FLOW_STEPS.length - 1 && (
              <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8h8M9 5l3 3-3 3" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-text-muted">{step.id}</span>
              <div className="h-px flex-1 bg-border-main" />
            </div>
            <h3 className="text-sm font-semibold text-text-main">{step.title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-text-secondary">{step.desc}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function DotGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />
  );
}
