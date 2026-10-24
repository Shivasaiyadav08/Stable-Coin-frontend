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
| `src/components/ManagePosition.tsx`      | Existing transaction form with review, debt impact and contract health checks                              |
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
