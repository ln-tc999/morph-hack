# BUILD IN! PAYMENTS — Project Context
## Track: x402 Agentic Payments

> Hackathon oleh Morph × Blockchain4Youth × DvCode Technologies Inc.
> Total Prize Pool: $3,500 USDC | Grand Prize: $1,200 USDC

---

## 🎯 Project Idea: **AgentPay SEA**

> *"The money layer for freelance AI agents in Southeast Asia"*

### Problem Statement
Freelancer digital di Indonesia, Filipina, dan SEA sering bekerja dengan klien luar negeri.
Proses invoice dan pembayaran masih manual, lambat, dan kena potongan tinggi.
AI Agent sudah bisa mengerjakan tugas — tapi belum bisa **dibayar atau membayar** secara otomatis.

AgentPay SEA membangun **payment layer berbasis x402** sehingga:
- AI Agent bisa menerima pembayaran per-task dari klien global
- AI Agent bisa membayar API/tools yang dibutuhkan untuk menyelesaikan tugasnya
- Semua settlement terjadi di Morph Network dengan biaya nyaris nol

---

## 📋 Hackathon Requirements Checklist

| Deliverable | Status | Notes |
|---|---|---|
| Project Write-Up (max 200 kata) | ⬜ | Draft di bawah |
| Public Demo URL | ⬜ | Deploy ke Vercel/Netlify |
| Demo Video 2 menit | ⬜ | Upload ke YouTube/X |
| Build Diary Posts (min 3) | ⬜ | #MorphBuildSprint #MorphBuildPH |
| Public Repository | ⬜ | GitHub |
| Architecture Diagram (optional, bonus) | ⬜ | Direkomendasikan |

### 📝 Draft Project Write-Up (≤200 kata)
```
AgentPay SEA solves a real problem: freelancers and SMEs in Indonesia and Southeast
Asia lose 5–15% of every international payment to fees and delays. Meanwhile, AI
agents are ready to work — but have no native way to get paid or pay for tools.

Using the x402 protocol on Morph Network, AgentPay SEA creates a micropayment layer
where AI agents can autonomously: (1) accept per-task payments from global clients
in USDC, (2) pay for APIs and tools mid-execution without human approval, and (3)
settle earnings to a local wallet in seconds.

We use Morph's low-cost EVM infrastructure for fast L2 settlement, USDC as the
stable medium of exchange, and x402's HTTP 402 standard so any API can be monetized
with one line of code.

This matters for SEA because the region has 70M+ freelancers with limited access to
global payment rails. AgentPay removes the middlemen, eliminates FX losses, and
gives autonomous agents — and the humans who run them — a money layer that works.
```

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENT / USER                  │
│         (Freelancer / Business Owner)            │
└──────────────────────┬──────────────────────────┘
                       │ Task Request + USDC deposit
                       ▼
┌─────────────────────────────────────────────────┐
│              AGENTPAY ORCHESTRATOR               │
│         (Next.js + AI Agent Logic)               │
│                                                  │
│  • Receives task & locks payment in escrow       │
│  • Spins up AI agent with USDC budget            │
│  • Monitors task completion                      │
└────────┬─────────────────────────┬──────────────┘
         │ x402 payment requests   │ task results
         ▼                         ▼
┌─────────────────┐     ┌─────────────────────────┐
│  EXTERNAL APIs  │     │     MORPH NETWORK (L2)  │
│  (paid via x402)│     │                         │
│                 │     │  • Escrow Smart Contract │
│  • Data APIs    │     │  • x402 Facilitator     │
│  • LLM APIs     │     │  • USDC Settlement      │
│  • Tool APIs    │     │  • Payment History Log  │
└─────────────────┘     └─────────────────────────┘
```

### Smart Contract Flow
```
1. Client → deposit USDC ke EscrowContract di Morph
2. Agent start → diberi spending limit (budget) dalam USDC
3. Agent butuh API → kirim HTTP request
4. Server balas HTTP 402 → Agent bayar via x402 otomatis
5. Task selesai → EscrowContract release payment ke Agent wallet
6. Sisa budget → refund ke Client
```

---

## 🛠️ Tech Stack

### Blockchain & Payments
| Tool | Kegunaan | Link |
|---|---|---|
| **Morph Network (L2)** | Settlement layer utama | https://docs.morph.network |
| **x402 Protocol** | HTTP payment standard | https://x402.org |
| **x402 npm package** | Client & server SDK | `npm install x402` |
| **USDC on Morph** | Stable currency | Morph token list |
| **Viem / Ethers.js** | EVM interaction | EVM compatible |

### Frontend & Backend
| Tool | Kegunaan |
|---|---|
| **Next.js 14** | Frontend + API routes |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Wagmi + RainbowKit** | Wallet connection |

### AI & Agent
| Tool | Kegunaan |
|---|---|
pakai yang sudah ada di apps kita ini

### Smart Contracts
| Tool | Kegunaan |
|---|---|
| **Hardhat / Foundry** | Contract development |
| **Solidity ^0.8.20** | Smart contract language |
| **OpenZeppelin** | ERC20 + security standards |

---

## 🔗 Resources Resmi

### Morph Network
- 📖 Docs: https://docs.morph.network
- 🔧 Developer Guide: https://docs.morph.network/docs/build-on-morph/developer-navigation-page
- 📦 Morph SDK: `npm install @morph-l2/sdk`
- 🌉 SDK Docs: https://docs.morph.network/docs/build-on-morph/sdk/globals/
- 🔍 Explorer: https://explorer.morph.network

### Testnet & Faucet
- 🚰 Morph Testnet Faucet: https://faucet.morphl2.io (dari dokumen hackathon: "Morph Rails Faucet")
- 🪣 Hoodi ETH Faucet: QuickNode Hoodi Faucet (link di hackathon page)
- 🌉 Morph Hoodi Bridge: Morph Hoodi Bridge (link di hackathon page)
- 🔗 Morph Mainnet Chain ID: **2818**
- 🔗 Morph Hoodi Testnet Chain ID: **2910**

### x402 Protocol
- 🌐 Official Site: https://x402.org
- 📖 Whitepaper: https://www.x402.org/x402-whitepaper.pdf
- 📖 Coinbase Docs: https://docs.cdp.coinbase.com/x402/welcome
- 💻 GitHub: https://github.com/coinbase/x402
- 📦 Install: `npm install x402`

### Network Config (tambahkan ke wallet)
```json
{
  "Morph Mainnet": {
    "chainId": "0xB02",
    "chainName": "Morph",
    "rpcUrls": ["https://rpc.morphl2.io"],
    "nativeCurrency": { "name": "ETH", "symbol": "ETH", "decimals": 18 },
    "blockExplorerUrls": ["https://explorer.morphl2.io"]
  },
  "Morph Hoodi Testnet": {
    "chainId": "0xB5E",
    "chainName": "Morph Hoodi Testnet",
    "rpcUrls": ["https://rpc-quicknode-holesky.morphl2.io"],
    "nativeCurrency": { "name": "ETH", "symbol": "ETH", "decimals": 18 },
    "blockExplorerUrls": ["https://explorer-holesky.morphl2.io"]
  }
}
```

---



Gunakan hashtag **#MorphBuildSprint** dan **#MorphBuildPH** di setiap post.

| Post | Kapan | Konten |
|---|---|---|
| **Post 1** | Hari 1–2 | Problem statement + wireframe awal + kenapa x402 |
| **Post 2** | Pertengahan | Demo x402 payment flow pertama berhasil, screenshot/video |
| **Post 3** | H-2 sebelum deadline | Full demo video preview, link repo, architecture diagram |
| *(Bonus)* | Hari lain | Bug yang ditemukan, lesson learned, community feedback |

### Template Post 1
```
🚀 Day 1 of #MorphBuildSprint!

Building AgentPay SEA — a payment layer for AI agents using x402 on @MorphL2.

Problem: 70M+ freelancers in SEA lose 5-15% to payment fees. AI agents
can work but can't pay or get paid natively.

Our fix: x402 + Morph = autonomous micropayments, near-zero fees.

Let's ship! 🛠️ #MorphBuildPH #Web3 #BuildInPublic
```

---

## 🎬 Demo Video Script (2 Menit)

### Segmen 1 — Problem (0:00–0:30)
> *"Imagine you're a freelancer in Jakarta. You send an invoice to a US client.
> They pay via wire transfer. 3 days later, you receive 88% of what you earned.
> The rest? Gone to banks and middlemen. Now imagine your AI agent has the same problem
> — it can work, but it can't get paid or pay for tools it needs. We built AgentPay SEA
> to fix this, using x402 on Morph Network."*

### Segmen 2 — Live Demo (0:30–1:30)
1. Tunjukkan dashboard: Client deposit USDC
2. Trigger AI agent untuk jalankan task
3. Tunjukkan agent otomatis bayar API via x402 (HTTP 402 response → payment → retry)
4. Task selesai → payment released ke freelancer wallet
5. Tunjukkan transaction on Morph explorer

### Segmen 3 — What's Next (1:30–2:00)
> *"Next: multi-agent workflows, PHP/IDR offramp integration, and
> opening AgentPay as a public API so any developer in SEA can monetize
> their own AI services with one line of code."*

---

## 📊 Judging Criteria & Strategy

| Kriteria | Bobot | Strategi |
|---|---|---|
| Technical Execution | 30% | Working x402 integration + deployed smart contract |
| Real-World Use Case | 25% | Framing freelancer SEA yang relatable |
| Product Design & UX | 15% | Dashboard yang clean, bukan crypto-native jargon |
| Innovation | 15% | x402 + AI Agent = kombinasi yang jarang dibangun |
| Demo Quality | 10% | Live demo tanpa login, langsung kerja |
| Build-in-Public | 5% | Min. 3 posts, mulai dari hari pertama |

---



```
Week 1:
  Day 1-2  → Setup repo, Morph testnet, x402 hello world
  Day 3-4  → Smart contract escrow (Solidity)
  Day 5    → x402 server endpoint + agent logic
  Day 6-7  → 📢 Build Diary Post #1 + #2

Week 2:
  Day 8-9  → Frontend dashboard (Next.js)
  Day 10   → End-to-end integration testing
  Day 11   → Deploy ke testnet, record demo video
  Day 12   → Architecture diagram, project write-up
  Day 13   → 📢 Build Diary Post #3
  Day 14   → Final submission
```

---

## ⚠️ Rules Reminder

- ✅ AI-assisted development diperbolehkan
- ✅ Tim tetap pemilik penuh proyeknya
- ⚠️ Existing product boleh, tapi **harus ada fitur baru signifikan**
- ❌ Plagiarism = diskualifikasi
- 📢 Build diary wajib untuk Community Choice eligibility

---

*Last updated: Build In! Payments Hackathon — Morph × Blockchain4Youth × DvCode*