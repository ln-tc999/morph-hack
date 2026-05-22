# AgentPay SEA — x402 Payment Layer for AI Agents

<p align="center">
  <img src="https://img.shields.io/badge/Network-Morph%20Hoodi-blue" alt="Morph">
  <img src="https://img.shields.io/badge/Payment-USDC-yellow" alt="USDC">
  <img src="https://img.shields.io/badge/Hackathon-Build%20In!%20Payments-purple" alt="Hackathon">
</p>

AgentPay SEA is a micropayment layer for AI agents, built on **x402 protocol** + **Morph Network**. Agents can autonomously accept per-task payments from global clients, pay for APIs mid-execution, and settle earnings in seconds — with near-zero fees.

Built for the **Build In! Payments Hackathon** by Morph × Blockchain4Youth × DvCode Technologies Inc.

---

## Deployment (Morph Hoodi Testnet)

| Contract | Address |
|----------|---------|
| **MockUSDC** | [`0x6d4d...9ea`](https://explorer-hoodi.morph.network/address/0x6d4d017de8d0a36dce7856ee989624c6a18cd9ea) |
| **Escrow** | [`0xd04a...3e6`](https://explorer-hoodi.morph.network/address/0xd04a92c83afe71f4f69f9fad0a33229bfbde33e6) |
| **x402Facilitator** | [`0x44b9...76d`](https://explorer-hoodi.morph.network/address/0x44b99f76f12e0ece22f6bd76dcb305afcf25876d) |

- **Deployer**: [`0x3a8d...84b`](https://explorer-hoodi.morph.network/address/0x3a8d93d5f52a26689b075a49e67f4f8924bec84b)
- **Network**: Morph Hoodi Testnet (Chain ID: 2910)
- **RPC**: `https://rpc-hoodi.morph.network`
- **Explorer**: `https://explorer-hoodi.morph.network`
- **MockUSDC minted**: 100,000 to deployer

---

## Overview

A full Agent-to-Agent (A2A) marketplace where AI agents autonomously buy and sell services using USDC on Morph Network.

### How It Works

1. **Connect** your wallet (RainbowKit)
2. **Browse** AI services across categories
3. **Purchase** — approve USDC → deposit to Escrow → confirm
4. **Receive** an access token to use the service
5. **Auto-buy** mode lets your agent purchase autonomously

---

## Features

### Marketplace
- Search, filter, sort, paginate listings
- Direct purchase, negotiation, subscriptions

### Payment Flow (x402 + Morph)
- USDC approve → Escrow deposit → on-chain settlement
- No webhook infrastructure needed — frontend-initiated confirm

### Auto-Buy Agent
- Autonomous purchasing by category + budget
- Smart scoring algorithm

### Dashboard
- Stats, preferences, activity log, purchase history
- Agent chat and service access tokens

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Styling | TailwindCSS v4 |
| State | Zustand (persisted) |
| Wallet | RainbowKit + Wagmi |
| Network | Morph Hoodi Testnet (Chain ID 2910) |
| Payments | x402 Protocol + Custom Escrow |
| Smart Contracts | Solidity ^0.8.28 (Hardhat) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm

### Installation

```bash
cd frontend
pnpm install
```

### Environment Variables

Create `.env.local`:

```env
# Morph Network
NEXT_PUBLIC_MORPH_CHAIN_ID=2910
NEXT_PUBLIC_MORPH_RPC_URL=https://rpc-hoodi.morph.network
NEXT_PUBLIC_MORPH_EXPLORER=https://explorer-hoodi.morph.network

# Contracts
NEXT_PUBLIC_USDC_CONTRACT=0x6d4d017de8d0a36dce7856ee989624c6a18cd9ea
NEXT_PUBLIC_ESCROW_CONTRACT=0xd04a92c83afe71f4f69f9fad0a33229bfbde33e6
NEXT_PUBLIC_X402_FACILITATOR=0x44b99f76f12e0ece22f6bd76dcb305afcf25876d

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

### Run

```bash
pnpm dev      # Dev server on port 3000
pnpm build    # Production build
npx tsc --noEmit  # Type check
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/marketplace/listings` | GET | Browse/search/filter listings |
| `/api/checkout` | POST | Create purchase + deposit intent |
| `/api/checkout` | GET | Poll purchase status |
| `/api/checkout/confirm` | POST | Confirm on-chain deposit, create access token |
| `/api/service-access` | GET | Query service access tokens |
| `/api/service-access` | DELETE | Revoke access token |
| `/api/negotiations` | POST/GET | Create/list negotiations |
| `/api/reviews` | POST/GET | Submit/list reviews |
| `/api/subscriptions` | POST/GET | Create/list subscriptions |
| `/api/auto-buy` | POST | Trigger auto-buy matching |

---

## Smart Contracts

### Escrow (`contracts/src/Escrow.sol`)
- `deposit(agent, amount)` — client locks USDC for an agent
- `release(lockId)` — release payment to agent after task completion
- `refund(lockId)` — refund remaining budget to client

### x402Facilitator (`contracts/src/x402Facilitator.sol`)
- `createIntent(payee, amount)` — create x402 payment intent
- `settle(intentId)` — settle a payment

### MockUSDC (`contracts/src/mock/MockUSDC.sol`)
- 6-decimal ERC20 for testnet minting

---

## Hackathon Submission

### Build In! Payments — Morph × Blockchain4Youth × DvCode Technologies

**Project**: AgentPay SEA

**What We Built**:
1. Full A2A marketplace with autonomous agent payments
2. x402 protocol integration on Morph Network
3. Escrow smart contract for secure payment settlement
4. RainbowKit wallet connection replacing Locus Wallet
5. USDC approve → deposit → confirm flow

---

## License

MIT
