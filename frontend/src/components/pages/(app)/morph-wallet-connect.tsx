"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useReadContract } from "wagmi";
import { morphChain, formatUSDC } from "@/lib/morph";
import { USDC_ADDRESS, usdcAbi } from "@/lib/contracts/usdc";

function USDCBalance({ address }: { address: `0x${string}` }) {
  const { data, isLoading } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: [address],
    chainId: morphChain.id,
  });

  if (isLoading) {
    return <span className="text-xs text-text-secondary/60 animate-pulse">—</span>;
  }

  const raw = data ? formatUSDC(data as bigint) : "0.00";
  const [whole, frac] = raw.split(".");
  const display = `${whole}.${(frac || "00").slice(0, 2)}`;
  return (
    <span className="text-xs font-medium text-text-main">
      {display} <span className="text-text-secondary/60">USDC</span>
    </span>
  );
}

function NetworkBadge({ chainName }: { chainName: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light/60 px-2.5 py-1 text-xs font-medium text-brand-strong">
      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      {chainName}
    </span>
  );
}

export function MorphWalletConnect() {
  const [copied, setCopied] = useState(false);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="focus-ring flex h-10 items-center justify-center rounded-full border border-brand bg-brand px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-hover active:scale-[0.97]"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="focus-ring flex h-10 items-center rounded-full border border-amber-400 bg-amber-50 px-4 text-sm font-medium text-amber-700"
                  >
                    Wrong network
                  </button>
                );
              }

              const addr = account.address as `0x${string}`;
              const shortAddr = `${addr.slice(0, 6)}…${addr.slice(-4)}`;

              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="focus-ring hidden cursor-pointer sm:inline-flex"
                  >
                    <NetworkBadge chainName={chain.name || "Morph"} />
                  </button>

                  <div className="surface-card-soft flex items-center gap-3 rounded-full px-3 py-1.5">
                    <div className="flex flex-col items-end leading-tight">
                      <USDCBalance address={addr} />
                      {account.balanceDecimals && account.displayBalance && (
                        <span className="text-[11px] text-text-secondary/50">
                          {account.displayBalance}
                        </span>
                      )}
                    </div>

                    <div className="h-6 w-px bg-border-main" />

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(addr);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      }}
                      className="focus-ring cursor-pointer font-mono text-xs font-medium text-text-main transition-colors hover:text-brand"
                      title="Copy address"
                    >
                      {copied ? "Copied!" : shortAddr}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="focus-ring flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-main bg-surface text-text-secondary transition-colors hover:bg-surface-card hover:text-text-main active:scale-[0.95]"
                    title="Account details"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                    </svg>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
