"use client";

import { useAccountEffect } from "wagmi";
import { useUserStore } from "@/store/user";
import { User, addActivityLog } from "@/data/store";

async function grantFreeAgents(userId: string) {
  try {
    await fetch("/api/service-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  } catch {
    /* server may be unavailable */
  }
}

async function syncAccesses(userId: string) {
  try {
    const res = await fetch(`/api/service-access?userId=${userId}`);
    const data = await res.json();
    const accesses = data.accesses || [];
    const addOwnedAgent = useUserStore.getState().addOwnedAgent;
    for (const a of accesses) {
      addOwnedAgent({
        id: a.id,
        purchaseId: a.purchaseId,
        listingId: a.listingId,
        sellerAgentId: a.sellerAgentId,
        accessToken: a.accessToken,
        status: a.status,
        expiresAt: a.expiresAt,
        accessTokenCreated: a.accessTokenCreated,
      });
    }
  } catch {
    /* server unavailable — rely on Zustand persisted state */
  }
}

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

      grantFreeAgents(existingUser.id).then(() => {
        syncAccesses(existingUser.id);
      });
    },
    onDisconnect() {
      useUserStore.setState({ user: null, isConnected: false, sessionConnectedAt: null });
    },
  });

  return null;
}
