"use client";

import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-main bg-surface">
      <div className="px-8 py-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Agent Service Marketplace
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-text-main sm:text-4xl">
          Buy, run, and monetize AI services from one cleaner workspace.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
          Connect your wallet, browse focused AI services, and let your agents
          handle repeatable tasks with better control.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/marketplace"
            className="focus-ring inline-flex cursor-pointer rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Browse Services
          </Link>
          <Link
            href="/dashboard/listing/new"
            className="focus-ring inline-flex cursor-pointer rounded-lg border border-border-main bg-main-bg px-5 py-2.5 text-sm font-semibold text-text-main transition-colors hover:bg-slate-100"
          >
            Create Listing
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { value: "6+", label: "Services available" },
            { value: "3+", label: "Active agent types" },
            { value: "USDC", label: "Morph-powered payments" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border-main bg-main-bg px-4 py-4">
              <p className="text-2xl font-semibold text-text-main">{item.value}</p>
              <p className="mt-1 text-sm text-text-secondary">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
