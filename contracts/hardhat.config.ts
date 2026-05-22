import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./src",
  },
  networks: {
    morphHoodi: {
      url: process.env.MORPH_RPC_URL || "https://rpc-hoodi.morph.network",
      chainId: 2910,
      accounts: [PRIVATE_KEY],
    },
    morphMainnet: {
      url: process.env.MORPH_MAINNET_RPC_URL || "https://rpc.morphl2.io",
      chainId: 2818,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
