import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const morphHoodi = {
  id: 2910,
  name: "Morph Hoodi Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc-hoodi.morph.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Morph Explorer",
      url: "https://explorer-hoodi.morph.network",
    },
  },
} as const;

export const morphMainnet = {
  id: 2818,
  name: "Morph Mainnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.morphl2.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Morph Explorer",
      url: "https://explorer.morphl2.io",
    },
  },
} as const;

export const morphChainId = Number(process.env.NEXT_PUBLIC_MORPH_CHAIN_ID || 2910);

export const morphChain = morphChainId === 2818 ? morphMainnet : morphHoodi;

export function createMorphPublicClient() {
  return createPublicClient({
    chain: morphChain,
    transport: http(),
  });
}

export function createMorphWalletClient(privateKey?: `0x${string}`) {
  if (!privateKey) {
    throw new Error("Private key required for wallet client");
  }
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: morphChain,
    transport: http(),
  });
}

export const USDC_DECIMALS = 6;

export function parseUSDC(amount: string): bigint {
  const [whole, fraction = ""] = amount.split(".");
  const padded = fraction.padEnd(USDC_DECIMALS, "0").slice(0, USDC_DECIMALS);
  return BigInt(whole + padded);
}

export function formatUSDC(amount: bigint): string {
  const s = amount.toString().padStart(USDC_DECIMALS + 1, "0");
  const whole = s.slice(0, -USDC_DECIMALS) || "0";
  const fraction = s.slice(-USDC_DECIMALS);
  return `${whole}.${fraction}`;
}

export function getExplorerTxUrl(txHash: string): string {
  const base = process.env.NEXT_PUBLIC_MORPH_EXPLORER || "https://explorer-hoodi.morph.network";
  return `${base}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  const base = process.env.NEXT_PUBLIC_MORPH_EXPLORER || "https://explorer-hoodi.morph.network";
  return `${base}/address/${address}`;
}
