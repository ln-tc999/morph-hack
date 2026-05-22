import hre from "hardhat";
import { defineChain } from "viem";

const morphHoodi = defineChain({
  id: 2_910,
  name: "Morph Hoodi",
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
});

async function main() {
  const publicClient = await hre.viem.getPublicClient({ chain: morphHoodi });
  const [deployer] = await hre.viem.getWalletClients({ chain: morphHoodi });
  console.log("Deployer:", deployer.account.address);

  const client = { public: publicClient, wallet: deployer };

  const usdc = await hre.viem.deployContract("MockUSDC", [], { client });
  console.log("MockUSDC deployed:", usdc.address);

  const escrow = await hre.viem.deployContract("Escrow", [usdc.address], { client });
  console.log("Escrow deployed:", escrow.address);

  const facilitator = await hre.viem.deployContract("x402Facilitator", [usdc.address], { client });
  console.log("x402Facilitator deployed:", facilitator.address);

  const DECIMALS = 6n;
  await usdc.write.mint([deployer.account.address, 100_000n * 10n ** DECIMALS]);
  console.log("Minted 100,000 MockUSDC to deployer");

  console.log("\n--- Summary ---");
  console.log(`NEXT_PUBLIC_USDC_CONTRACT=${usdc.address}`);
  console.log(`NEXT_PUBLIC_ESCROW_CONTRACT=${escrow.address}`);
  console.log(`NEXT_PUBLIC_X402_FACILITATOR=${facilitator.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
