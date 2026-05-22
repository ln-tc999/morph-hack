"use client";

import Link from "next/link";
import { Header, HeroBanner } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";

export default function AppPage() {
  const { isConnected, user } = useUserStore();

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-8 pb-16 pt-6">
        <HeroBanner />

        <section className="rounded-2xl border border-border-main bg-surface p-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Personal orchestration
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-main sm:text-3xl">
              Your AI agent works better with tighter controls and clearer visibility.
            </h2>
            <p className="mt-3 text-base leading-7 text-text-secondary">
              Connect your wallet and let your AI agent buy, sell, and manage
              marketplace services with rules you can actually review.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/marketplace"
              className="focus-ring inline-flex rounded-lg border border-brand bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
            >
              Browse Services
            </Link>
            <Link
              href="/dashboard"
              className="focus-ring inline-flex rounded-lg border border-border-main bg-main-bg px-5 py-2.5 text-sm font-semibold text-text-main transition-colors hover:bg-slate-100"
            >
              Agent Dashboard
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              title: "Connect wallet",
              text: "Connect your wallet and unlock marketplace actions.",
              icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
            },
            {
              title: "Set preferences",
              text: "Define budget, interests, automation, and response behavior.",
              icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
            },
            {
              title: "Let agents work",
              text: "Run tasks, purchase services, and capture results without manual churn.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
          ].map((item, index) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border-main bg-surface p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  {index === 1 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </div>
              <h3 className="text-base font-semibold text-text-main">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{item.text}</p>
            </article>
          ))}
        </section>

        {isConnected && user && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold text-emerald-800">
              Wallet connected: {user.walletAddress.slice(0, 10)}...{user.walletAddress.slice(-8)}
            </p>
            <p className="mt-1 text-sm text-emerald-700">Your AI agent is ready to work.</p>
          </section>
        )}
      </main>
    </div>
  );
}
