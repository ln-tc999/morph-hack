"use client";

import Link from "next/link";

const CAPABILITIES = [
  {
    tag: "Payments",
    title: "Agents pay APIs autonomously",
    desc: "When an agent hits an HTTP 402 response, it pays instantly via x402 — no human approval, no interruption.",
    detail: "POST /api/data → 402 → pay → 200",
    href: "/marketplace",
    cta: "See services",
  },
  {
    tag: "Escrow",
    title: "Budget locked, not lost",
    desc: "Client deposits USDC into a smart contract. Agent spends only what it needs. Remainder refunds automatically.",
    detail: "Morph L2 · Solidity · USDC",
    href: "/dashboard",
    cta: "Open dashboard",
  },
  {
    tag: "Settlement",
    title: "Near-zero fees on Morph",
    desc: "All payments settle on Morph Network L2. Transactions cost fractions of a cent — viable for micropayments.",
    detail: "Chain ID 2818 · ~$0.00 gas",
    href: "/marketplace",
    cta: "Start a task",
  },
];

const AGENT_TYPES = [
  {
    name: "Research Agent",
    status: "active",
    task: "Scraping market data",
    spent: "0.84 USDC",
    calls: 12,
  },
  {
    name: "Writer Agent",
    status: "active",
    task: "Drafting SEO content",
    spent: "1.20 USDC",
    calls: 8,
  },
  {
    name: "Data Agent",
    status: "idle",
    task: "Awaiting task",
    spent: "0.00 USDC",
    calls: 0,
  },
];

export function HomeCapabilities() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CAPABILITIES.map((cap) => (
          <article
            key={cap.tag}
            className="flex flex-col rounded-2xl border border-border-main bg-surface p-6"
          >
            <div className="mb-4 inline-flex w-fit rounded-md border border-border-main bg-main-bg px-2.5 py-1">
              <span className="text-xs font-semibold text-text-secondary">{cap.tag}</span>
            </div>
            <h3 className="text-base font-semibold leading-snug text-text-main">{cap.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-text-secondary">{cap.desc}</p>
            <div className="mt-4 rounded-lg border border-border-main bg-main-bg px-3 py-2">
              <code className="font-mono text-xs text-text-muted">{cap.detail}</code>
            </div>
            <Link
              href={cap.href}
              className="focus-ring mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
            >
              {cap.cta}
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-border-main bg-surface p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Agent activity
            </p>
            <h2 className="mt-1 text-lg font-semibold text-text-main">
              Your agents, right now
            </h2>
          </div>
          <Link
            href="/agents"
            className="focus-ring cursor-pointer rounded-lg border border-border-main bg-main-bg px-4 py-2 text-sm font-semibold text-text-main transition-colors hover:bg-slate-100"
          >
            Manage agents
          </Link>
        </div>

        <div className="divide-y divide-border-main">
          {AGENT_TYPES.map((agent) => (
            <div key={agent.name} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border-main bg-main-bg">
                  <svg className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                  </svg>
                  {agent.status === "active" && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-surface bg-emerald-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-main">{agent.name}</p>
                  <p className="text-xs text-text-secondary">{agent.task}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="font-mono text-sm font-semibold text-text-main">{agent.spent}</p>
                  <p className="text-xs text-text-muted">spent</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold text-text-main">{agent.calls}</p>
                  <p className="text-xs text-text-muted">API calls</p>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  agent.status === "active"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-main-bg text-text-muted"
                }`}>
                  {agent.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
