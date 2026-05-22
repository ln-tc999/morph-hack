export const X402_FACILITATOR_ADDRESS = (process.env.NEXT_PUBLIC_X402_FACILITATOR || "0x") as `0x${string}`;

export const x402FacilitatorAbi = [
  {
    type: "function",
    name: "createIntent",
    inputs: [
      { name: "payee", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "intentId", type: "bytes32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "settle",
    inputs: [{ name: "intentId", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getIntent",
    inputs: [{ name: "intentId", type: "bytes32" }],
    outputs: [
      { name: "payer", type: "address" },
      { name: "payee", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "paymentId", type: "bytes32" },
      { name: "settled", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "usdc",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "IntentCreated",
    inputs: [
      { name: "intentId", type: "bytes32", indexed: true },
      { name: "payee", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "IntentSettled",
    inputs: [
      { name: "intentId", type: "bytes32", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;
