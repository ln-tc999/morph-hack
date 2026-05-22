"use client";

import { useAccountEffect } from "wagmi";
import { useUserStore } from "@/store/user";
import { User, addActivityLog } from "@/data/store";

const FREE_LISTINGS = [
  { listingId: "svc-001", sellerAgentId: "agent-001" },
  { listingId: "svc-003", sellerAgentId: "agent-003" },
  { listingId: "svc-005", sellerAgentId: "agent-005" },
];

export function SessionHydrator() {
  const { user, setUser } = useUserStore();

  useAccountEffect({
    onConnect(data) {
      const address = data.address?.toLowerCase();
      if (!address) return;
      if (user?.walletAddress === address) return;

      const existingUser: User = {
        id: user?.id || `user_${crypto.randomUUID().slice(0, 8)}`,
        walletAddress: address,
        createdAt: user?.createdAt || new Date().toISOString(),
      };

      setUser(existingUser);
      addActivityLog(existingUser.id, "INFO", "Connected wallet via RainbowKit");

      // Sync to Zustand immediately (no server round-trip)
      const { ownedAgents, addOwnedAgent } = useUserStore.getState();
      const existingIds = new Set(ownedAgents.map((a) => a.listingId));
      for (const f of FREE_LISTINGS) {
        if (existingIds.has(f.listingId)) continue;
        const now = new Date().toISOString();
        addOwnedAgent({
          id: `acc_${crypto.randomUUID().slice(0, 8)}`,
          purchaseId: `free_${f.listingId}`,
          listingId: f.listingId,
          sellerAgentId: f.sellerAgentId,
          accessToken: `cusygen_${f.listingId}_${crypto.randomUUID().slice(0, 12)}`,
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          accessTokenCreated: now,
        });
      }

      // Best-effort sync to server
      fetch("/api/service-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: existingUser.id }),
      }).catch(() => {});
    },
    onDisconnect() {
      useUserStore.setState({ user: null, isConnected: false, sessionConnectedAt: null });
    },
  });

  return null;
}
