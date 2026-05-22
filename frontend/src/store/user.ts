"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Preferences, defaultPreferences } from '@/data/store';
import { OwnedAgent } from '@/types/marketplace';

export interface ApiKeys {
  openai: string;
  claude: string;
  gemini: string;
}

interface UserState {
  user: User | null;
  preferences: Preferences;
  isConnected: boolean;
  ownedAgents: OwnedAgent[];
  apiKeys: ApiKeys;
  sessionConnectedAt: string | null;
  setUser: (user: User | null) => void;
  setPreferences: (prefs: Preferences) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
  addOwnedAgent: (agent: OwnedAgent) => void;
  revokeOwnedAgent: (id: string) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  disconnect: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      preferences: defaultPreferences,
      isConnected: false,
      ownedAgents: [],
      apiKeys: { openai: '', claude: '', gemini: '' },
      sessionConnectedAt: null,
      setUser: (user) => set({
        user,
        isConnected: user !== null,
        sessionConnectedAt: user !== null ? new Date().toISOString() : null,
      }),
      setPreferences: (preferences) => set({ preferences }),
      updatePreferences: (newPrefs) => set((state) => ({
        preferences: { ...state.preferences, ...newPrefs }
      })),
      addOwnedAgent: (agent) => set((state) => ({
        ownedAgents: state.ownedAgents.some((a) => a.id === agent.id)
          ? state.ownedAgents
          : [...state.ownedAgents, agent],
      })),
      revokeOwnedAgent: (id) => set((state) => ({
        ownedAgents: state.ownedAgents.map((a) =>
          a.id === id ? { ...a, status: 'REVOKED' as const } : a
        ),
      })),
      setApiKey: (provider, key) => set((state) => ({
        apiKeys: { ...state.apiKeys, [provider]: key },
      })),
      disconnect: () => set({
        user: null,
        isConnected: false,
        preferences: defaultPreferences,
        ownedAgents: [],
        apiKeys: { openai: '', claude: '', gemini: '' },
        sessionConnectedAt: null,
      }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        isConnected: state.isConnected,
        preferences: state.preferences,
        ownedAgents: state.ownedAgents,
        apiKeys: state.apiKeys,
        sessionConnectedAt: state.sessionConnectedAt,
      }),
    }
  )
);
