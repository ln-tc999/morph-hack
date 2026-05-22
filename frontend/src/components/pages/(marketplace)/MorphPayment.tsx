"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useUserStore } from "@/store/user";
import { usdcAbi, USDC_ADDRESS } from "@/lib/contracts/usdc";
import { escrowAbi, ESCROW_ADDRESS } from "@/lib/contracts/escrow";
import { parseUSDC, formatUSDC, getExplorerTxUrl } from "@/lib/morph";

interface Props {
  listing: { id: string; title: string; priceUSDC: string };
  sellerAgentId: string;
  buyerAgentId: string;
}

type Step = "idle" | "creating" | "approve" | "approving" | "deposit" | "depositing" | "confirming" | "done" | "error";

export function MorphPayment({ listing, sellerAgentId, buyerAgentId }: Props) {
  const addOwnedAgent = useUserStore((s) => s.addOwnedAgent);
  const { address } = useAccount();

  const [step, setStep] = useState<Step>("idle");
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [agentAddress, setAgentAddress] = useState<string>("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ accessToken: string; transactionId: string } | null>(null);

  const amountWei = parseUSDC(listing.priceUSDC);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: usdcAbi,
    functionName: "allowance",
    args: address ? [address, ESCROW_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeDeposit, data: depositHash } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproved } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositing, isSuccess: isDeposited } = useWaitForTransactionReceipt({ hash: depositHash });

  const needsApproval = allowance !== undefined && allowance < amountWei;

  const handleCreatePurchase = async () => {
    setStep("creating");
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: listing.priceUSDC,
          listingId: listing.id,
          sellerAgentId,
          buyerAgentId,
          buyerUserId: buyerAgentId,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setStep("error");
        return;
      }

      setPurchaseId(data.purchaseId);
      setAgentAddress(data.agentAddress);
      setStep(needsApproval ? "approve" : "deposit");
    } catch {
      setError("Failed to create purchase");
      setStep("error");
    }
  };

  const handleApprove = () => {
    setStep("approving");
    writeApprove({
      address: USDC_ADDRESS,
      abi: usdcAbi,
      functionName: "approve",
      args: [ESCROW_ADDRESS, amountWei],
    });
  };

  const handleDeposit = () => {
    if (!agentAddress) return;
    setStep("depositing");
    writeDeposit({
      address: ESCROW_ADDRESS,
      abi: escrowAbi,
      functionName: "deposit",
      args: [agentAddress as `0x${string}`, amountWei],
    });
  };

  const handleConfirm = async () => {
    if (!purchaseId) return;
    setStep("confirming");

    try {
      const res = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseId,
          transactionId: depositHash || txHash,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setStep("error");
        return;
      }

      const now = new Date().toISOString();
      addOwnedAgent({
        id: `acc_${crypto.randomUUID().slice(0, 8)}`,
        purchaseId: purchaseId,
        listingId: listing.id,
        sellerAgentId,
        accessToken: data.accessToken,
        status: "ACTIVE",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        accessTokenCreated: now,
      });

      setResult({ accessToken: data.accessToken, transactionId: data.transactionId });
      setStep("done");
    } catch {
      setError("Failed to confirm purchase");
      setStep("error");
    }
  };

  if (step === "done" && result) {
    return (
      <div className="glass-panel rounded-[1.25rem] border border-emerald-200/70">
        <div className="border-b border-emerald-200/70 px-5 py-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base font-semibold text-emerald-800">Purchase complete</span>
          </div>
          <p className="mt-1 text-sm text-emerald-700">
            You now have access to &quot;{listing.title}&quot;
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-800">Transaction</p>
            <p className="mt-1 text-sm text-emerald-700">Paid ${listing.priceUSDC} USDC on Morph</p>
            {result.transactionId && (
              <a
                href={getExplorerTxUrl(result.transactionId)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                View on Explorer
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-800">Access token</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="field-shell flex-1 rounded-xl px-3 py-3 text-xs font-mono text-text-main">
                {result.accessToken}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(result.accessToken)}
                className="focus-ring rounded-xl border border-emerald-600 bg-emerald-600 px-3 py-3 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="glass-inset rounded-[0.875rem] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">Next steps</p>
            <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-text-secondary">
              <li>Go to My Agents to start chatting.</li>
              <li>Give your agent a concrete task.</li>
              <li>Review results and continue the workflow.</li>
              <li>Service remains active for 1 year.</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-2 border-t border-emerald-200/70 px-5 py-3">
          <Link href="/agents" className="focus-ring flex-1 rounded-full border border-emerald-600 bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700">
            Start Using Agent
          </Link>
          <Link href="/marketplace" className="focus-ring flex-1 rounded-full border border-border-main bg-white/80 px-4 py-2.5 text-center text-sm font-medium text-text-main hover:bg-white">
            Browse More
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing =
    step === "creating" ||
    step === "approving" ||
    step === "depositing" ||
    step === "confirming";

  return (
    <div className="glass-inset rounded-[0.875rem] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-text-main">Purchase this service</p>
          <p className="mt-1 text-sm text-text-secondary">
            {step === "idle" && "Pay with USDC on Morph Network."}
            {step === "creating" && "Creating purchase intent..."}
            {(step === "approve" || step === "approving") && "Approve USDC spending for escrow."}
            {(step === "deposit" || step === "depositing") && "Deposit USDC to secure the service."}
            {step === "confirming" && "Confirming your purchase..."}
            {step === "error" && "Something went wrong. Try again."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-brand">${listing.priceUSDC}</p>
          <p className="text-xs text-text-secondary">USDC on Morph</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {step === "idle" && (
          <button
            type="button"
            onClick={handleCreatePurchase}
            className="focus-ring w-full rounded-full border border-brand bg-brand py-4 text-base font-semibold text-white hover:bg-brand-hover"
          >
            Buy with USDC
          </button>
        )}

        {step === "approve" && (
          <button
            type="button"
            onClick={handleApprove}
            className="focus-ring w-full rounded-full border border-brand bg-brand py-4 text-base font-semibold text-white hover:bg-brand-hover"
          >
            Approve USDC
          </button>
        )}

        {step === "approving" && (
          <div className="flex items-center justify-center gap-2 rounded-full bg-brand/10 py-4">
            <svg className="h-5 w-5 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-brand">Approving USDC...</span>
          </div>
        )}

        {isApproved && step === "approving" && (
          <div className="text-center">
            <p className="text-sm text-emerald-600">USDC approved!</p>
            <button
              type="button"
              onClick={() => setStep("deposit")}
              className="focus-ring mt-2 w-full rounded-full border border-brand bg-brand py-4 text-base font-semibold text-white hover:bg-brand-hover"
            >
              Deposit to Escrow
            </button>
          </div>
        )}

        {step === "deposit" && (
          <button
            type="button"
            onClick={handleDeposit}
            className="focus-ring w-full rounded-full border border-brand bg-brand py-4 text-base font-semibold text-white hover:bg-brand-hover"
          >
            Deposit ${listing.priceUSDC} USDC
          </button>
        )}

        {step === "depositing" && (
          <div className="flex items-center justify-center gap-2 rounded-full bg-brand/10 py-4">
            <svg className="h-5 w-5 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-brand">Depositing to Escrow...</span>
          </div>
        )}

        {isDeposited && step === "depositing" && (
          <button
            type="button"
            onClick={handleConfirm}
            className="focus-ring w-full rounded-full border border-brand bg-brand py-4 text-base font-semibold text-white hover:bg-brand-hover"
          >
            Confirm Purchase
          </button>
        )}

        {step === "confirming" && (
          <div className="flex items-center justify-center gap-2 rounded-full bg-brand/10 py-4">
            <svg className="h-5 w-5 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-brand">Confirming purchase...</span>
          </div>
        )}

        {step === "error" && (
          <div>
            <p className="mb-3 text-center text-sm text-red-600">{error || "Transaction failed"}</p>
            <button
              type="button"
              onClick={() => setStep("idle")}
              className="focus-ring w-full rounded-full border border-border-main bg-white/80 py-4 text-base font-semibold text-text-main hover:bg-white"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {step === "idle" && (
        <p className="mt-3 text-center text-xs text-text-secondary">
          Pay with USDC. Secured by Morph Network.
        </p>
      )}
    </div>
  );
}
