# DSC Protocol frontend

A Next.js interface for the DSC Engine on Ethereum Sepolia. Visitors can learn
about the project, inspect public positions without a wallet, and manage their
own collateral and DSC debt.

This is experimental testnet software. No production deployment, audit status,
liquidity, or stable-value guarantee is implied.

<div align="center">
  <img src="./public/logo.svg" alt="DSC Protocol" width="140" />

  <h1>DSC Protocol</h1>
  <p>Decentralized Stablecoin Interface on Ethereum Sepolia</p>

  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Ethereum-Sepolia-627EEA?logo=ethereum&logoColor=white" />
  <img src="https://img.shields.io/badge/Network-Testnet-blueviolet" />
</div>


## Local setup

Use Node.js 24 and npm. Local setup, CI and Vercel use the same major version:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000).

For optional configuration, copy `.env.example` to `.env.local`:

```dotenv
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_SEPOLIA_RPC_URL=
```

Installed browser wallets work without a WalletConnect project ID.
Add a real project ID from [Reown Dashboard](https://dashboard.reown.com) to
enable WalletConnect and mobile QR connections. Leave it empty to use browser
wallets only. A nonempty placeholder is not a valid project ID.

The public Sepolia RPC is the default. For more reliable access, configure a
dedicated RPC URL. Every `NEXT_PUBLIC_` value is included in the browser bundle:
use a public, domain-restricted RPC credential rather than a private server key.
Restart the dev server after environment changes. Set these variables before
building a deployed app.

## Tech Stack

<p align="left">
  <img src="https://skillicons.dev/icons?i=nextjs,ts,react,tailwind,solidity,nodejs,vercel,github" alt="Tech Stack" />
</p>

## Routes

| Route        | Purpose                                                        |
| ------------ | -------------------------------------------------------------- |
| `/`          | Public project overview and protocol workflow                  |
| `/dashboard` | Wallet position, deposit, mint, burn, and redeem               |
| `/explore`   | Public account lookup and eligible liquidation                 |
| `/docs`      | Getting started, contract rules, transactions, and attribution |

## Code map

- `src/lib/contracts.ts`: network, deployment address, and readable engine ABI.
- `src/hooks/useProtocol.ts`: shared protocol and account queries.
- `src/hooks/useManagePosition.ts`: form state, validation, review, and action preparation.
- `src/components/ManagePosition.tsx`: position form markup, using the hook above.
- `src/lib/amounts.ts`: integer amount parsing, formatting, and health calculations.
- `src/lib/transactions.ts`: exact approvals, simulation, signatures, and receipts.
- `src/components/TransactionProvider.tsx`: transaction feedback and query refresh.
- `src/components/RiskGauge.tsx`: the shared health-factor instrument.
- `src/components/ProtocolFlow.tsx`: interactive SVG mechanism; no WebGL required.
- `src/components/ProtocolMechanics.tsx`: clearly labeled educational example.
- `src/lib/risk.ts`: position status using the contract's liquidation boundary.
- `src/app/globals.css`: one token palette, responsive styles, and native motion.

Read the position workflow in this order:

1. `src/app/dashboard/page.tsx` puts the dashboard together.
2. `src/components/ManagePosition.tsx` renders the form and calls its hook.
3. `src/hooks/useManagePosition.ts` validates input, previews the position, then requests execution.
4. `src/lib/transactions.ts` handles token approval, simulation, wallet signatures, and receipts.
5. `src/components/TransactionProvider.tsx` shows progress and refreshes the shared queries.

Page markup stays in `app/`, reusable interface elements in `components/`, React
state and queries in `hooks/`, and contract definitions and calculations in `lib/`.
The form follows the contract minimum; it adds no extra risk threshold.

The interface discovers the DSC token, approved collateral, token decimals,
and liquidation parameters from the engine. Sepolia is the only enabled
network. Local Anvil deployments need their own verified deployment configuration.

The current engine also lists a collateral address whose ERC-20 metadata is
unavailable on Sepolia. The interface excludes it from selectable assets without
inventing its balance or decimals. Correcting
that address requires a smart-contract deployment change.

## Transaction behavior

Amounts are entered in token units. Deposit approval uses the selected collateral;
repayment and liquidation approve the exact DSC amount. The app simulates writes
and pins approval, writes, and receipt tracking to Sepolia. Wallet/account changes
are checked before each signature.

A first submit shows an estimate; a second submit requests signatures. Prices
and state may change, so the contract remains the final validator. Inputs are
cleared only after confirmation. Confirmed transactions refresh shared queries;
positions also refresh every 15 seconds while visible. A refresh failure after
confirmation is reported separately from a failed transaction.

Theoretical mint capacity is not a recommended borrowing target. Max uses the
contract boundary, which can leave no health buffer. Position status follows
only the contract minimum; there are no additional frontend risk thresholds.

## Framework security updates

The project uses Next.js and its ESLint configuration at `15.5.28`. Vercel blocks
the older `15.5.6` version even when compilation succeeds. The scoped `sharp`
override in `package.json` keeps Next.js's image-processing dependency at `0.35.5`
instead of retaining the vulnerable version in an older lockfile. See the
[official security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026).

The Web3 stack remains on compatible major versions: RainbowKit `2.2.11`,
Wagmi `2.18.1`, and Viem `2.57.11`. Wagmi stays pinned to the working release;
the newer connector tree imports optional Coinbase payment modules that break
this Next.js build. Two other overrides keep PostCSS at `8.5.31`
and WebSocket 8 dependencies at `8.21.0`. These replace vulnerable pinned copies
inside other packages; they do not add new application code.

After dependency changes, include both `package.json` and `package-lock.json` in
your update so Vercel installs the same versions. Do not bypass the security block.
The latest audit still reports wallet SDK advisories. See the
[dependency review](docs/MIDNIGHT_FINANCE.md#dependency-maintenance-follow-up)
for remaining issues and compatibility limits. Avoid `npm audit fix --force`:
RainbowKit currently requires Wagmi 2, while npm proposes Wagmi 3 for some fixes.

## Design and attribution

The Solidity foundation comes from [Patrick Collins / Cyfrin](https://github.com/Cyfrin/foundry-defi-stablecoin-cu).
The frontend and this Sepolia integration are Shiva Sai's contributions.
The public interface makes this distinction and includes the testnet disclaimer.

The illustration is an SVG with a bounded pointer tilt and accessible step
buttons. Scroll reveals use native CSS view timelines where supported, with a
static fallback. Reduced-motion preferences disable animation and pointer tilt.
The landing example is labeled and never supplies data to account queries.

Geist is served locally through `next/font/local` using the `geist` package.
Tailwind CSS 4 and its PostCSS integration provide utility classes alongside
readable component CSS. No 3D or animation runtime is installed.

See [the implementation record](docs/MIDNIGHT_FINANCE.md) for the changed-file
map, dependency changes and read-only deployment verification.

## Checks

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

Tests use Node's built-in runner and module mocks. They exercise decimal
precision, risk calculations, readable errors, selected-token approval, DSC
liquidation allowance, account/network changes, and cancelled/reverted receipts.
They do not broadcast transactions or prove deployed-contract availability.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the review checklist.

Smart contracts: [Stable-Coin](https://github.com/Shivasaiyadav08/Stable-Coin).
