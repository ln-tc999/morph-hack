"use client";

import Link from "next/link";
import { useUserStore } from "@/store/user";

export function HomeCta() {
  const { isConnected, user } = useUserStore();

  if (isConnected && user) {
    return (
      <section className="rounded-2xl border border-border-main bg-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-main">
                Wallet connected
              </p>
              <p className="font-mono text-xs text-text-secondary">
                {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
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
              Dashboard
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-main bg-[#0f172a] p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Get started
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
            Connect your wallet to unlock the full agent marketplace.
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Deposit USDC, spin up an agent, and let it handle tasks — autonomously, on Morph Network.
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="focus-ring inline-flex cursor-pointer rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Browse Services
          </Link>
          <Link
            href="/dashboard/listing/new"
            className="focus-ring inline-flex cursor-pointer rounded-lg border border-slate-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white"
          >
            Create Listing
          </Link>
        </div>
      </div>
    </section>
  );
}
