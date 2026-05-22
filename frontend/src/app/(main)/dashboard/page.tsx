"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/pages/(app)";
import { useUserStore } from "@/store/user";
import { StatsPanel } from "@/components/pages/(app)/stats-panel";
import { PreferencesPanel } from "@/components/pages/(app)/preferences-panel";
import { ActivityLogPanel } from "@/components/pages/(app)/activity-log";
import {
  Purchase,
  Subscription,
  Listing,
  getAgentById,
  getListingById,
} from "@/data/store";

export default function DashboardPage() {
  const { user, isConnected, preferences } = useUserStore();
  const [activeTab, setActiveTab] = useState<"purchases" | "listings" | "subscriptions">("purchases");
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myPurchases, setMyPurchases] = useState<Purchase[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (!isConnected || !user) return;
    (async () => {
      try {
        const [listingsRes, purchasesRes, subsRes] = await Promise.all([
          fetch("/api/marketplace/listings"),
          fetch("/api/service-access?userId=" + user.id),
          fetch("/api/subscriptions?userId=" + user.id),
        ]);
        const listingsData = await listingsRes.json();
        setMyListings((listingsData.listings || []).filter((l: Listing) => l.userId === user!.id));

        const accessData = await purchasesRes.json();
        const purchases: Purchase[] = (accessData.accesses || []).map((a: { purchaseId: string; listingId: string; sellerAgentId: string; buyerUserId: string; status: string; createdAt: string }) => ({
          id: a.purchaseId || a.listingId,
          listingId: a.listingId,
          sellerAgentId: a.sellerAgentId,
          buyerUserId: a.buyerUserId,
          amount: "0",
          status: a.status === "ACTIVE" ? "CONFIRMED" as const : "PENDING" as const,
          autoPurchased: false,
          createdAt: a.createdAt || new Date().toISOString(),
        }));
        setMyPurchases(purchases);

        const subsData = await subsRes.json();
        setMySubscriptions(subsData.subscriptions || []);
      } catch {}
    })();
  }, [user, isConnected]);

  const totalTrackedVolume = [...myPurchases, ...mySubscriptions].reduce(
    (sum, item) => sum + Number(item.amount || 0), 0,
  );
  const activeAutomationCount =
    Number(Boolean(preferences.autoBuyEnabled)) + Number(Boolean(preferences.autoListEnabled));
  const activeSubscriptions = mySubscriptions.filter((s) => s.status === "ACTIVE").length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-main-bg">
        <Header />
        <main className="mx-auto max-w-4xl px-8 pb-16 pt-16 text-center">
          <div className="rounded-2xl border border-border-main bg-surface p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-brand-light">
              <svg className="h-8 w-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Dashboard access</p>
            <h1 className="mt-3 text-2xl font-semibold text-text-main">Connect your wallet</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-text-secondary">
              Connect your wallet to open the control center for purchases, listings, subscriptions, and agent settings.
            </p>
            <p className="mt-6 text-sm text-text-muted">Use the "Connect Wallet" button in the header.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 px-8 pb-16 pt-6">

        {/* Hero summary */}
        <section className="rounded-2xl border border-border-main bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Agent control center</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-main">
            Your marketplace activity at a glance.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-text-secondary">
            Track purchases, monitor agent performance, and manage your marketplace activity from one place.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: "Tracked volume", value: `$${totalTrackedVolume.toFixed(2)}`, sub: "Purchases and subscriptions combined." },
              { label: "Automation rules", value: `${activeAutomationCount}/2 active`, sub: "Auto-buy and auto-list controls." },
              { label: "Recurring services", value: `${activeSubscriptions}`, sub: "Active subscriptions." },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border-main bg-main-bg px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-text-main">{stat.value}</p>
                <p className="mt-1 text-sm text-text-secondary">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <StatsPanel />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <PreferencesPanel />
          <ActivityLogPanel maxItems={15} showFilters={true} />
        </div>

        {/* Records table */}
        <section className="overflow-hidden rounded-2xl border border-border-main bg-surface">
          <div className="flex flex-col gap-4 border-b border-border-main px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-main">Marketplace records</h2>
              <p className="mt-0.5 text-sm text-text-secondary">
                Review purchases, listings, and recurring subscriptions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist">
              {[
                { key: "purchases", label: "Purchases", count: myPurchases.length },
                { key: "listings", label: "Listings", count: myListings.length },
                { key: "subscriptions", label: "Subscriptions", count: mySubscriptions.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key as "purchases" | "listings" | "subscriptions")}
                  className={`focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "border-brand bg-brand text-white"
                      : "border-border-main bg-main-bg text-text-secondary hover:text-text-main"
                  }`}
                >
                  {tab.label}
                  <span className={`rounded px-1.5 py-0.5 text-xs ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-border-main text-text-muted"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === "purchases" && (
              myPurchases.length === 0 ? (
                <EmptyState
                  message="No purchases yet"
                  sub="You have not purchased any services yet."
                  action={<Link href="/marketplace" className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">Browse Marketplace →</Link>}
                />
              ) : (
                <div className="space-y-3">
                  {myPurchases.map((purchase) => {
                    const seller = getAgentById(purchase.sellerAgentId);
                    return (
                      <div key={purchase.id} className="flex flex-col gap-4 rounded-xl border border-border-main bg-main-bg px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                            <span className="text-xs font-bold text-brand">${purchase.amount}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-main">Purchase #{purchase.id.slice(-6)}</p>
                            <p className="text-xs text-text-secondary">from {seller?.name || "Unknown"}</p>
                          </div>
                        </div>
                        <StatusBadge status={purchase.status} />
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === "listings" && (
              myListings.length === 0 ? (
                <EmptyState
                  message="No listings yet"
                  sub="Start earning by creating your first listing."
                  action={<Link href="/dashboard/listing/new" className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover">Create Listing +</Link>}
                />
              ) : (
                <div className="space-y-3">
                  {myListings.map((listing) => (
                    <div key={listing.id} className="flex flex-col gap-4 rounded-xl border border-border-main bg-main-bg px-4 py-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                          <span className="text-xs font-bold text-brand">${listing.priceUSDC}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-main">{listing.title}</p>
                          <p className="text-xs text-text-secondary">{listing.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${listing.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                          {listing.active ? "Active" : "Inactive"}
                        </span>
                        <span className="text-sm text-text-secondary">{listing.totalSales} sales</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === "subscriptions" && (
              mySubscriptions.length === 0 ? (
                <EmptyState
                  message="No subscriptions yet"
                  sub="Recurring services will appear here once you subscribe."
                  action={<Link href="/marketplace" className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-main bg-main-bg px-4 py-2 text-sm font-semibold text-text-main hover:bg-slate-100">Explore Services</Link>}
                />
              ) : (
                <div className="space-y-3">
                  {mySubscriptions.map((subscription) => {
                    const listing = getListingById(subscription.listingId);
                    const seller = getAgentById(subscription.sellerAgentId);
                    return (
                      <div key={subscription.id} className="flex flex-col gap-4 rounded-xl border border-border-main bg-main-bg px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light">
                            <span className="text-xs font-bold text-brand">${subscription.amount}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-main">
                              {listing?.title || `Subscription #${subscription.id.slice(-6)}`}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {subscription.planType === "annual" ? "Annual" : "Monthly"} · {seller?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={subscription.status} />
                          <span className="text-xs text-text-secondary">
                            Next bill {new Date(subscription.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function EmptyState({ message, sub, action }: { message: string; sub: string; action: React.ReactNode }) {
  return (
    <div className="py-12 text-center">
      <p className="text-base font-medium text-text-main">{message}</p>
      <p className="mt-1 mb-5 text-sm text-text-secondary">{sub}</p>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-800",
    ACTIVE: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    PAUSED: "bg-amber-100 text-amber-800",
    PENDING: "bg-amber-100 text-amber-800",
    CANCELLED: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}
