"use client";

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
    return <span className="text-xs text-text-secondary animate-pulse">...</span>;
  }

  const formatted = data ? formatUSDC(data as bigint) : "0.00";
  return (
    <span className="text-xs text-text-secondary">
      {formatted} USDC
    </span>
  );
}

export function MorphWalletConnect() {
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
                    className="focus-ring flex h-11 items-center justify-center rounded-full border border-brand bg-brand px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-brand-hover"
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
                    className="focus-ring flex h-11 items-center rounded-full border border-amber-400 bg-amber-50 px-4 text-sm font-medium text-amber-700"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="focus-ring surface-card-soft flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm text-text-secondary transition-colors duration-200 hover:text-text-main"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden sm:inline">{chain.name}</span>
                  </button>

                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="focus-ring surface-card-soft flex h-11 cursor-pointer items-center gap-2 rounded-full px-3 py-2 transition-colors duration-200 hover:bg-white/80"
                  >
                    <div className="flex flex-col items-end">
                      <USDCBalance address={account.address as `0x${string}`} />
                      <span className="text-xs font-mono text-text-main">
                        {account.displayName}
                      </span>
                    </div>
                    {account.balanceDecimals && (
                      <span className="hidden text-xs text-text-secondary sm:inline">
                        {account.displayBalance
                          ? ` (${account.displayBalance})`
                          : ""}
                      </span>
                    )}
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
