# Midnight Finance implementation

The existing Next.js 15 application was updated in place on `main`. No branch,
commit, push, or smart-contract repository change is part of this work.

## Presentation and component map

| File                                     | Responsibility                                                                                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/app/globals.css`                    | One Midnight Finance palette, shared controls, responsive layouts, native motion, reduced-motion overrides |
| `src/app/layout.tsx`                     | Local Geist font, metadata, shared page frame; removed theme-storage script                                |
| `src/app/page.tsx`                       | Public landing page, four-step mechanism, deployed parameters, contract register, attribution              |
| `src/app/dashboard/page.tsx`             | Compact financial terminal with a dedicated action panel                                                   |
| `src/app/docs/page.tsx`                  | Accurate model, risk guidance, educational attribution and disclaimer                                      |
| `src/app/providers.tsx`                  | Existing Web3 providers with a single matching RainbowKit dark theme                                       |
| `src/app/icon.svg`                       | Geometric DSC brand favicon                                                                                |
| `src/components/Header.tsx`              | Active route, DSC identity, network and wallet controls                                                    |
| `src/components/Footer.tsx`              | Navigation, sources, attribution and testnet disclaimer                                                    |
| `src/components/BrandMark.tsx`           | Small reusable geometric SVG identity                                                                      |
| `src/components/NetworkStatus.tsx`       | Current wallet chain from Wagmi; identifies unsupported chains                                             |
| `src/components/ProtocolFlow.tsx`        | Lightweight pointer-reactive SVG and keyboard-accessible mechanism steps                                   |
| `src/components/ProtocolMechanics.tsx`   | Explicitly educational debt slider, separate from account data                                             |
| `src/components/RiskGauge.tsx`           | Reusable health-factor instrument, with no invented historical data                                        |
| `src/components/PositionSummary.tsx`     | Actual balances, debt, capacity, contract health status and block number                                   |
| `src/components/ManagePosition.tsx`      | Form markup using the position action hook                                                                 |
| `src/hooks/useManagePosition.ts`         | Form state, input validation, position review and transaction preparation                                  |
| `src/components/GitHubLink.tsx`          | Accessible repository link and isolated SVG icon                                                           |
| `src/components/TransactionProvider.tsx` | Existing receipt/refresh logic with visible transaction stages                                             |
| `src/lib/contracts.ts`                   | Preserved ABI/address; added deployment token address, attribution and disclaimer constants                |
| `src/lib/risk.ts`                        | Readable presentation-only risk classification                                                             |
| `src/lib/errors.ts`                      | Preserves specific account/network-change errors before generic network fallback                           |
| `src/hooks/useProtocol.ts`               | Existing shared reads; exposes the block used for the account snapshot                                     |
| `tests/risk.test.mjs`                    | No-debt and exact contract liquidation boundary regression tests                                           |
| `README.md`, `CONTRIBUTING.md`           | Updated setup, styling, motion, architecture and review guidance                                           |

`ThemeProvider.tsx`, the switcher, the light palette and theme-persistence script
were removed. Contract interaction remains in the existing hooks and transaction
module. Nothing broadcasts transactions without a wallet signature.

## Dependencies

`package.json` and `package-lock.json` record these changes. The restored
`postcss.config.mjs` enables Tailwind. `tests/errors.test.mjs` also adds a
network-change message regression test. This document is the change record.

- Added `geist` for a locally served font. No Google Fonts request is needed.
- Restored the original Tailwind CSS 4.1.14 and matching PostCSS integration.
- No Three.js, React Three Fiber, Motion, animation engine, or icon library was
  added. The SVG stays useful without pointer support or WebGL.

The page reveal uses native CSS view timelines where supported. Other browsers
render static content. Reduced-motion preferences disable reveals, motion and
pointer tilt. Mobile does not run pointer tilt.

## On-chain verification

Read-only RPC verification on 24 October 2026, Sepolia block **11983137**:

| Item                         | Result                                                             |
| ---------------------------- | ------------------------------------------------------------------ |
| Chain                        | Ethereum Sepolia, `11155111`                                       |
| Engine                       | `0xE7346418690ED8e133B145D236daC9A48c8C269c`                       |
| Engine bytecode              | Present, 8,036 bytes                                               |
| DSC token returned by engine | `0xE9543340546545d8f3ab470d00c809D37f364B7A`                       |
| Liquidation threshold        | 50 / 100                                                           |
| Minimum health factor        | 1e18, displayed as 1.0                                             |
| Liquidation bonus            | 10 / 100                                                           |
| WETH metadata                | `WETH`, 18 decimals                                                |
| Other configured collateral  | `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063`, metadata unavailable |

The unreadable asset stays excluded from selection without a dashboard notice.
Fixing the contract's asset
configuration is outside a visual frontend change. Bytecode presence and reads
do not establish an audit or explorer source-verification status.

The displayed 200% minimum collateralization follows the configured 50%
threshold and 1.0 minimum. Position status uses only the contract minimum, with
no additional frontend warning band. Max uses actual
contract capacity; there is no arbitrary safe-borrowing percentage.

The interactive landing example uses labeled illustrative USD values and the
verified fixed model. It is never passed into the dashboard queries. Account
data comes only from the existing contract reads.

The Solidity source and attribution were read from the smart-contract repository:
[Stable-Coin](https://github.com/Shivasaiyadav08/Stable-Coin). The educational
foundation is [Patrick Collins / Cyfrin](https://github.com/Cyfrin/foundry-defi-stablecoin-cu).

## Validation

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run format:check` and
`npm run build`. Browser checks should include the four routes, mobile widths,
the educational slider, mechanism buttons, wallet dialog, unsupported-chain
guards and actual public account reads. No unapproved writes are part of QA.

Executed during implementation:

- TypeScript checking, ESLint, formatting check, and production build passed.
  The build required an unrestricted worker process on this Windows host;
  the sandbox could not connect to the PostCSS worker.
- All 19 tests passed. Wallet and transaction tests use mocks, not real funds.
- All four routes passed horizontal-overflow checks at 320, 375, 768, 1024,
  and 1440 CSS pixels in the production preview.
- The mechanism step buttons changed the explanation and highlighted stage.
  Keyboard input changed the educational debt slider to 650 DSC; the displayed
  health factor became 0.769 and the status became Liquidatable.
- The wallet dialog opened in the matching dark palette. No wallet was connected,
  no network switch was performed in a real wallet, and no transaction was sent.
  Account/network changes and receipt rejection are covered by the mocked tests.
- Invalid account input produced an associated validation error. Public lookup
  of the engine address returned actual balances and No debt. The displayed
  snapshot advanced from block 11983308 to 11983313 without a page reload.
- The production browser reported no captured errors or warnings during these
  checks. The body used Geist and the exact background rgb(8, 13, 25); no theme
  selector remained.

Reduced-motion fallbacks were reviewed in the code; no OS preference was changed
to emulate that mode. The existing unreadable collateral remains the only
deployment issue identified by these checks. This is not a contract audit.

## Readability and deployment maintenance

The position form now keeps its state and contract interaction in
`useManagePosition.ts`. `ManagePosition.tsx` renders the controls and review.
The action names are deposit, mint, burn and redeem throughout this workflow.
Named label functions replace nested conditions, and transaction updates share
one state-update function. The existing approval and receipt service is preserved.
The README includes a short reading order for new contributors.

The supplied Vercel log compiled successfully, then failed a dependency security
check for Next.js 15.5.6. Next.js and `eslint-config-next` are updated to 15.5.28.
A scoped override updates Next.js's retained `sharp` dependency to 0.35.5.
Node.js is pinned to 24.x, matching `.nvmrc` and CI. See the
[official security update](https://nextjs.org/blog/nextjs-security-update-october-14-2026).

The initial cleanup reported 43 dependency advisories (23 high, 20 moderate).
The follow-up below records the current dependency review and remaining findings.
No commit, push, remote deployment or blockchain transaction is part of this update.

Validation after the cleanup:

- TypeScript, ESLint, all 19 existing tests, formatting, and the Next.js 15.5.28
  production build passed.
- Sharp 0.35.5 loaded its native library and generated a small PNG successfully.
- The production browser switched between all four position actions. Collateral
  selection appeared for Deposit and Redeem, and disconnected inputs and submit
  buttons stayed disabled.
- Invalid explorer input showed its validation message. A public engine-address
  lookup returned live Sepolia account data at block 11983717.
- Dashboard widths 320, 375, 768, 1024, and 1440 had no horizontal overflow.
  Landing, dashboard, explorer and guide navigation worked without captured
  browser errors or warnings.
- No real wallet was connected and no transaction was signed. Existing mocked
  transaction tests do not substitute for a funded-wallet integration test.

## Dependency maintenance follow-up

Compatible updates and non-forced audit fixes reduced the audit from 43 findings
to **24: 10 high and 14 moderate**, with no critical findings. These counts refer
to affected packages, including packages inheriting a finding from a dependency.
Next.js, PostCSS and WebSocket no longer appear in the audit report.

| Package                 | Selected version | Reason                                                  |
| ----------------------- | ---------------- | ------------------------------------------------------- |
| RainbowKit              | 2.2.11           | Latest compatible release; requires Wagmi 2             |
| Wagmi                   | 2.18.1           | Pinned working connector tree                           |
| Viem                    | 2.57.11          | Updated within the existing major version               |
| PostCSS                 | 8.5.31           | Override replaces Next.js's pinned 8.4.31 copy          |
| WebSocket (`ws`)        | 8.21.0           | Override patches only existing WebSocket 8 dependencies |
| Next.js / ESLint config | 15.5.28          | Retained framework security patch                       |
| Sharp                   | 0.35.5           | Retained image-processing security override             |

`npm audit fix` was run without `--force`. Its compatible transitive fixes are
recorded in `package-lock.json`. Contract interaction logic, addresses, ABIs and
health rules did not change in this follow-up. A small `globals.css` correction
lets RainbowKit's compact dialog fit 320px screens: its library minimum width
otherwise places the close button outside the viewport.

Wagmi remains pinned because the 2.19.5 connector tree brings in Base Account
2.4.0 and Coinbase CDP SDK 1.60.0. Their optional x402 payment imports fail to
resolve in this Turbopack build. The working 2.18.1 connector tree is retained;
no payment dependencies are added to the application.

The remaining findings originate in wallet SDK dependencies:

| Root dependency      | Installed copies                  | Why it is not forcibly overridden                                                                     |
| -------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Zod                  | 3.22.4 / 3.25.76                  | The patched release is 4.6.6; replacing Zod 3 requires schema compatibility work in its SDK consumers |
| UUID                 | 8.3.2 and other older SDK copies  | The patched release starts at 11.1.1, outside the SDKs' declared major versions                       |
| decode-uri-component | 0.2.2, through query-string 7.1.3 | The fixed 0.5.1 release is ESM; the installed consumer uses CommonJS                                  |

RainbowKit 2.2.11 declares `wagmi: ^2.9.0`. npm's suggested forced upgrade to
Wagmi 3.7.9 would violate that peer requirement. No audit findings are suppressed,
and the current dependency tree is not claimed to be vulnerability-free.

Sources: [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5),
[UUID advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq),
[URI decoder advisory](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr),
[PostCSS release](https://github.com/postcss/postcss/releases/tag/8.5.31).
Package versions, peer requirements and module formats were checked using npm's registry.

Final validation for this follow-up:

- The final lockfile passed `npm ci --dry-run --ignore-scripts --no-audit --no-fund`.
- TypeScript, ESLint, formatting, all 19 tests, and the production build passed.
- The production wallet dialog opened at desktop width and 320px. The phone
  correction kept its close button within the viewport, and clicking it closed
  the dialog successfully.
- Public account lookup returned actual Sepolia data at block 11984217 using the
  updated Viem release. The phone layout had no horizontal overflow.
- No browser errors or warnings were captured during these checks. No real
  wallet was connected and no on-chain transaction was signed.
- The final audit returned 24 findings. `next`, `postcss`, `ws` and `sharp` were
  absent from the vulnerability report. The remaining findings are documented above.
