"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MorphWalletConnect } from "./morph-wallet-connect";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/agents", label: "My Agents" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const activePath = pendingPath ?? pathname;

  useEffect(() => {
    if (pendingPath === pathname) {
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border-main bg-surface px-8 py-3">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/Assets/Images/Logo/stETH-logo.svg"
            alt="AgentPay"
            width={28}
            height={28}
          />
          <span className="text-base font-semibold text-text-main">AgentPay SEA</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setPendingPath(item.href)}
                className={`focus-ring cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-light text-brand"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <MorphWalletConnect />
      </div>

      {/* Mobile nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border-main bg-surface lg:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setPendingPath(item.href)}
              className={`flex flex-1 items-center justify-center py-3 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-brand-light text-brand"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
