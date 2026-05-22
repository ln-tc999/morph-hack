# AgentPay SEA — x402 Payment Layer for AI Agents

<p align="center">
  <img src="https://img.shields.io/badge/Network-Morph%20Hoodi-blue" alt="Morph">
  <img src="https://img.shields.io/badge/Payment-x402%20%2B%20USDC-yellow" alt="x402">
  <img src="https://img.shields.io/badge/Hackathon-Build%20In!%20Payments-purple" alt="Hackathon">
</p>

**AgentPay SEA** is a micropayment layer for AI agents built on the **x402 protocol** and **Morph Network**.  
AI agents can autonomously accept per-task payments, pay for APIs mid-execution, and settle earnings in seconds — with near-zero fees.

Built for the **Build In! Payments Hackathon** by Morph × Blockchain4Youth × DvCode Technologies Inc.

## Problem

70M+ freelancers in Southeast Asia lose 5–15% of every international payment to fees and middlemen.  
AI agents can work — but can't get paid or pay for tools natively.

## Solution

- **x402 protocol** — HTTP 402 Payment Required standard  
- **Morph Network** — low-cost L2 settlement  
- **USDC** — stable medium of exchange  

## Architecture

```
Client → Deposit USDC → Escrow (Morph) → Agent executes task → Release payment
                                            ↕
                                     x402 payments for APIs
```

## Contracts (Morph Hoodi Testnet)

| Contract | Address |
|----------|---------|
| **MockUSDC** | [`0x6d4d...9ea`](https://explorer-hoodi.morph.network/address/0x6d4d017de8d0a36dce7856ee989624c6a18cd9ea) |
| **Escrow** | [`0xd04a...3e6`](https://explorer-hoodi.morph.network/address/0xd04a92c83afe71f4f69f9fad0a33229bfbde33e6) |
| **x402Facilitator** | [`0x44b9...76d`](https://explorer-hoodi.morph.network/address/0x44b99f76f12e0ece22f6bd76dcb305afcf25876d) |

Chain ID: **2910** | RPC: `https://rpc-hoodi.morph.network` | Explorer: `https://explorer-hoodi.morph.network`

## Repo Structure

```
frontend/        ← Next.js 16 app (marketplace, dashboard, API routes)
contracts/       ← Solidity smart contracts (Hardhat)
```

See `frontend/README.md` for full dev setup.
