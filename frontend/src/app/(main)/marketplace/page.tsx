"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header, HeroBanner, GlassSelect } from "@/components/pages/(app)";
import { CATEGORIES } from "@/data/store";

interface Listing {
  id: string;
  sellerAgentId: string;
  sellerName: string;
  sellerWallet: string;
  title: string;
  description: string;
  category: string;
  priceUSDC: string;
  active: boolean;
  totalSales: number;
  createdAt?: string;
}

const ITEMS_PER_PAGE = 9;

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/api/marketplace/listings")
      .then((res) => res.json())
      .then((data) => setListings(data.listings || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredListings = useMemo(() => {
    let result = [...listings];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q),
      );
    }
    if (category) result = result.filter((l) => l.category === category);
    if (priceRange) {
      result = result.filter((l) => {
        const p = parseFloat(l.priceUSDC);
        if (priceRange === "0-0.1") return p <= 0.1;
        if (priceRange === "0.1-0.25") return p > 0.1 && p <= 0.25;
        if (priceRange === "0.25-0.5") return p > 0.25 && p <= 0.5;
        if (priceRange === "0.5+") return p > 0.5;
        return true;
      });
    }
    if (sortBy === "price-low") result.sort((a, b) => parseFloat(a.priceUSDC) - parseFloat(b.priceUSDC));
    else if (sortBy === "price-high") result.sort((a, b) => parseFloat(b.priceUSDC) - parseFloat(a.priceUSDC));
    else if (sortBy === "popular") result.sort((a, b) => b.totalSales - a.totalSales);
    else if (sortBy === "newest") result.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return result;
  }, [listings, search, category, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const hasFilters = Boolean(search || category || priceRange);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setPriceRange("");
    setSortBy("popular");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-main-bg">
      <Header />
      <main className="mx-auto max-w-6xl space-y-6 px-8 pb-16 pt-6">
        <HeroBanner />

        <section className="rounded-2xl border border-border-main bg-surface p-6">
          <h2 className="text-lg font-semibold text-text-main">Available services</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.7fr))]">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search services..."
              className="focus-ring rounded-xl border border-border-main bg-main-bg px-4 py-2.5 text-sm text-text-main placeholder:text-text-secondary focus:border-brand focus:outline-none"
            />
            <GlassSelect
              value={category}
              onChange={(val) => { setCategory(val); setCurrentPage(1); }}
              placeholder="All Categories"
              options={[
                { value: "", label: "All Categories" },
                ...CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
            <GlassSelect
              value={priceRange}
              onChange={(val) => { setPriceRange(val); setCurrentPage(1); }}
              placeholder="All Prices"
              options={[
                { value: "", label: "All Prices" },
                { value: "0-0.1", label: "Under $0.10" },
                { value: "0.1-0.25", label: "$0.10 – $0.25" },
                { value: "0.25-0.5", label: "$0.25 – $0.50" },
                { value: "0.5+", label: "Over $0.50" },
              ]}
            />
            <div className="flex items-center gap-2">
              <GlassSelect
                className="flex-1"
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={[
                  { value: "popular", label: "Most Popular" },
                  { value: "price-low", label: "Price: Low → High" },
                  { value: "price-high", label: "Price: High → Low" },
                  { value: "newest", label: "Newest" },
                ]}
              />
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="focus-ring cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-brand hover:bg-brand-light"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:150ms]" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand [animation-delay:300ms]" />
            </div>
          </div>
        ) : paginatedListings.length === 0 ? (
          <div className="rounded-2xl border border-border-main bg-surface p-10 text-center">
            <p className="text-base font-medium text-text-main">No services found</p>
            <p className="mt-2 text-sm text-text-secondary">Adjust the filters or search term and try again.</p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="focus-ring mt-4 cursor-pointer rounded-lg bg-brand-light px-4 py-2 text-sm font-medium text-brand"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedListings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/marketplace/listing/${listing.id}`}
                  className="group block rounded-2xl border border-border-main bg-surface p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="inline-flex rounded-lg bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand">
                        {listing.category}
                      </span>
                      <h3 className="mt-3 text-base font-semibold text-text-main transition-colors group-hover:text-brand">
                        {listing.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">
                        {listing.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-border-main pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-text-main">{listing.sellerName}</span>
                      {listing.totalSales > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          ★ {listing.totalSales}
                        </span>
                      )}
                    </div>
                    <span className="rounded-lg bg-brand px-3 py-1.5 text-sm font-bold text-white">
                      ${listing.priceUSDC}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="focus-ring cursor-pointer rounded-lg border border-border-main bg-surface px-4 py-2 text-sm text-text-main disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-text-secondary">
                  Page <span className="font-semibold text-text-main">{currentPage}</span> of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="focus-ring cursor-pointer rounded-lg border border-border-main bg-surface px-4 py-2 text-sm text-text-main disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
