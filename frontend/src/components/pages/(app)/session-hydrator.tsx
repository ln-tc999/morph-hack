"use client";

import { useAccountEffect } from "wagmi";
import { useUserStore } from "@/store/user";
import { User, addActivityLog } from "@/data/store";

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
    },
    onDisconnect() {
      useUserStore.setState({ user: null, isConnected: false, sessionConnectedAt: null });
    },
  });

  return null;
}
