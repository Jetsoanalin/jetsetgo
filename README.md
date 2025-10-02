# JetSet Travel Rewards Monorepo

Two Next.js PWAs in a single repository:

- JetSet Points (App A): loyalty vault, admin allocations, utilities, crypto deposits
- JetSet Pay (App B): local QR payments, wallet + points, receipts/history, map

Both apps share code via a workspace package `@jetset/shared`.

## Repository Structure

```
OriginsToken2049/
├─ apps/
│  ├─ jetsetpoints/        # App A (Next.js App Router, PWA)
│  └─ jetsetpay/           # App B (Next.js App Router, PWA)
├─ packages/
│  └─ shared/              # Shared TS utilities (Supabase, i18n, countries, auth, etc.)
├─ turbo.json              # Turborepo pipeline
├─ package.json            # Root workspace config + scripts
└─ tsconfig.json
```

## Prerequisites

- Node.js ≥ 18.18.0
- npm ≥ 10 (workspaces enabled)
- Supabase project (URL + anon key + service role key)

## Install & Build

```bash
# From repo root
npm i

# Build shared package (optional; Next usually compiles it on the fly)
npm run build:shared

# Dev (both apps, or open one workspace)
npm run dev:points     # App A
npm run dev:pay        # App B
```

## Environment Variables

Create `.env.local` inside each app with the following (copy these to Vercel Project Settings → Environment Variables too):

### Common (both apps)

```
NEXT_PUBLIC_SUPABASE_URL=...            # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...       # Supabase anon key
```

### App A (JetSet Points)

```
# Crypto deposit derivation
MNEMONIC="word1 word2 ... word12"      # Shared seed for deterministic user deposit addresses
# Optional alternative env name also checked
EVM_MNEMONIC=...

# RPCs for background poller (optional in dev)
ALCHEMY_URL=...                         # or ALCHEMY_MAINNET / ALCHEMY_SEPOLIA
BSC_RPC_TESTNET=...
POLYGON_RPC_TESTNET=...
CELO_RPC_TESTNET=...

# Optional token addresses for poller
ETH_USDC=...                            # Defaults provided if empty
ETH_USDT=...
```

### App B (JetSet Pay)

No extra envs beyond Supabase in the basic flow.

> Important: For server-side Supabase Admin (service role) operations we use `@jetset/shared/getSupabaseAdmin` in API routes. Do NOT expose service role on the client.

## Supabase Tables (minimum)

Create these tables with RLS enabled (owner policies or user-id scoping as required):

- `wallet_balances` (userId uuid, currency text, balance numeric)
- `payments` (id uuid default uuid_generate_v4(), userId uuid, merchantId text, amount numeric, currency text, method text, countryCode text, placeName text, createdAt timestamptz)
- `payment_qr_details` (payment_id uuid, scheme text, mode text, aid text, billerId text, proxyId text, merchantName text, ref1 text, ref2 text, rawPayload text, decoded jsonb)
- `points_balances` (userId uuid, balance numeric)
- `points_ledger` (id uuid default uuid_generate_v4(), userId uuid, deltaJP integer, description text, createdAt timestamptz default now())
- `user_wallet_indices` (userId uuid, evmIndex int, tonIndex int)
- `user_chain_addresses` (userId uuid, chainFamily text, chainId text, address text, derivationIndex int)

> The code expects lowercase column names in some APIs; align your schema accordingly or adjust the queries.

## Key Features

- App A (JetSet Points)
  - Dashboard with points balance, tiering, recent activity
  - Admin allocations
  - Utilities marketplace (eSIM, Insurance, NFT Passport, Badges)
  - Binance-like crypto deposit flow: derive per-user EVM/TON addresses from `MNEMONIC`, display QR, auto-credit points (poller for ERC20; TON TODO)
  - Deterministic mock transaction hash shown on all receipts without DB storage

- App B (JetSet Pay)
  - 3-step payment: Amount → Review (wallet/points) → Receipt
  - QR scan (PromptPay/Thai) → decode AID/merchant/etc.
  - Wallet USD + points balances with realtime updates
  - Wallet deduction on wallet payments; points deduction on points payments
  - Receipts with deterministic mock Tx Hash; history and map pages styled to match dashboard

## Development Notes

- Shared utilities live in `packages/shared` and are published in the workspace as `@jetset/shared`.
- i18n, countries, and regulations are centralised. Country conversion chips pull from `/api/conversion` (in App A) and shared country tables.
- The mock Tx Hash is generated via `@jetset/shared/mockTx.mockTxHash(seed)`. It’s purely deterministic from receipt fields.
- TON Jetton monitoring is left as TODO (requires minter + wallet resolution).

## Running Locally

```bash
# App A (JetSet Points)
npm run dev:points
# http://localhost:3000

# App B (JetSet Pay)
npm run dev:pay
# http://localhost:3000
```

Login is via Supabase email magic links (`/auth/callback` handlers are included in both apps).

## Deploying to Vercel

Recommended: 2 Projects in the same Vercel account from this repo.

- Project 1: `apps/jetsetpoints`
  - Root Directory: `apps/jetsetpoints`
  - Build Command: `npm run build`
  - Output: `.next`
  - Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `MNEMONIC`, RPC envs (optional), etc.

- Project 2: `apps/jetsetpay`
  - Root Directory: `apps/jetsetpay`
  - Build Command: `npm run build`
  - Output: `.next`
  - Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Root config

- Root `package.json` uses npm workspaces and Turborepo; make sure it includes:
  ```json
  {
    "workspaces": ["apps/*", "packages/*"],
    "packageManager": "npm@10.x"
  }
  ```

- `turbo.json` must start with the proper schema key:
  ```json
  {
    "$schema": "https://turbo.build/schema.json",
    "pipeline": {
      "build": { "dependsOn": ["^build"], "outputs": [".next/**"] },
      "dev": { "cache": false },
      "lint": {}
    }
  }
  ```

### Cron / Background Jobs

- (Optional) Set up a Vercel Cron hitting `apps/jetsetpoints/app/api/deposit/poller` every 2–5 minutes to auto-credit ERC20 deposits → points.

## Troubleshooting

- Turborepo errors on Vercel (workspaces): ensure `packageManager` is set and root has `workspaces`.
- MNEMONIC not found for deposit address API: the route reads `process.env.MNEMONIC || EVM_MNEMONIC`; also falls back to reading `apps/jetsetpoints/.env.local` on the server.
- Missing logos: we use `cdn.simpleicons.org` & CoinMarketCap PNGs; ensure external image domains are allowed in `next.config.js` (or rely on plain `<img>` tags as in repo).
- Wallet not deducting: verify App B `/pay/review` is at latest version (deducts USD via `/api/wallet`).

## Scripts

```bash
npm run dev             # turbo run dev (both)
npm run dev:points      # App A only
npm run dev:pay         # App B only
npm run build           # turbo run build
npm run build:shared    # compile shared package
npm run lint            # turbo run lint
```

## Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client; use it only in server routes.
- Mnemonic is for test/demo only; do not use a production seed.

## License

MIT (for hackathon/demo usage). Update as needed for production. 