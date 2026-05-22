# AGENTS.md

## Commands

```bash
pnpm dev         # Next.js dev server (port 3000)
pnpm build       # Production build
pnpm lint        # Biome check (not ESLint)
npx tsc --noEmit # Typecheck (no dedicated script; compose manually if needed)
```

Package manager is **pnpm** (per `package.json` `packageManager` field).  
Dockerfile uses `npm ci` — that's a deploy concern, not for local dev.

## Project structure

This is **AgentPay SEA** — x402 payment layer for AI agents on Morph Network.

```
frontend/               ← the Next.js 16 app
├── src/
│   ├── app/(main)/     ← pages (agents/, dashboard/, marketplace/, page.tsx)
│   ├── app/api/        ← 11 API route groups
│   ├── components/pages/(app)/ and (marketplace)/
│   ├── components/ui/
│   ├── data/store.ts   ← ALL models + in-memory DB (no persistence)
│   ├── store/{user,agent,theme}.ts  ← Zustand stores
│   ├── types/marketplace.ts
│   └── lib/
│       ├── morph.ts    ← viem chain config (Morph Hoodi + mainnet), USDC helpers
│       ├── x402.ts     ← x402 payment request/response helpers
│       └── contracts/  ← ABI + address constants for Escrow, x402Facilitator, USDC
├── contracts/           ← Solidity (Hardhat project)
│   ├── src/
│   │   ├── Escrow.sol
│   │   ├── x402Facilitator.sol
│   │   └── mock/MockUSDC.sol
│   ├── scripts/deploy.ts
│   ├── hardhat.config.ts
│   └── package.json
└── CLAUDE.md            ← authoritative style guide (read before writing UI)
```

Key facts:
- **No database.** In-memory store in `data/store.ts`. Restart dev server to reset.
- **No tests.** No test framework in dependencies.
- **`/agents` page** at `src/app/(main)/agents/page.tsx` (not in README).
- Path alias: `@/` → `./src/*`.

## Commands

```bash
# Frontend (Next.js)
pnpm dev
pnpm build
pnpm lint            # Biome check
npx tsc --noEmit     # manual typecheck

# Contracts (Hardhat)
cd contracts && npx hardhat compile
cd contracts && npx hardhat run scripts/deploy.ts --network morphHoodi
```

Package manager for frontend is **pnpm**. Contracts use **npm**.

## Style rules (from CLAUDE.md)

- **Blue + White minimal**: primary `#2563eb`, background `#f8fafc`, text `#0f172a`, border `#e2e8f0`
- No emojis, gradients, colorful accents, neon, Web3 glow, heavy shadows
- `sonner` for toasts, `clsx` + `tailwind-merge` for classes, `motion` for animations
- No comments in code (strict rule)
- Buttons: primary = blue bg + white text; secondary = white bg + blue border

## Morph Network (new payment layer)

| Network | Chain ID | RPC |
|---------|----------|-----|
| Hoodi testnet | 2910 | `https://rpc-hoodi.morph.network` |
| Mainnet | 2818 | `https://rpc.morphl2.io` |

Contract addresses set via env vars: `NEXT_PUBLIC_USDC_CONTRACT`, `NEXT_PUBLIC_ESCROW_CONTRACT`, `NEXT_PUBLIC_X402_FACILITATOR`.

Payment flow (post-migration):
1. Client approves USDC → Escrow contract `deposit(agent, amount)`
2. Agent uses x402 to pay for APIs mid-task (HTTP 402 → approve → retry)
3. Task done → Escrow `release(lockId)` → agent paid
4. Remaining budget → Escrow `refund(lockId)` → client refunded

## Gotchas

- `bun.lock` and `package-lock.json` both exist in frontend; ignore both — use `pnpm-lock.yaml`
- `push.sh` at repo root is for per-file git commits, not part of the app
- No `typecheck` npm script — run `npx tsc --noEmit` when needed
(no Locus dependencies remain)
