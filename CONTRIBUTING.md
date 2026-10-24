# Contributing to the DSC frontend

Use Node.js 24 (22.18 or later is supported), install with `npm ci`, and follow
the README to run locally. Browser wallets work without a WalletConnect ID.
Only Sepolia has a configured deployment.

## Keep changes easy to understand

- Prefer plain components, semantic HTML, Tailwind utilities, and the shared
  Midnight Finance CSS tokens. There is one theme; do not add alternate palettes.
- Keep contract reads in `src/hooks/useProtocol.ts` and transaction sequencing
  in `src/lib/transactions.ts`.
- Keep financial calculations in bigint. Parse human input with token decimals;
  never use floating point or silently round transaction amounts.
- Never turn a failed RPC request into a zero balance or an assumed price.
- Use explicit feedback states. Keep user input on failure and refresh queries
  after confirmed transactions.
- Add a network only when its engine address and contract behavior are verified.
  Never reuse Sepolia addresses for a local Anvil deployment.

## Before opening a pull request

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Test the overview, dashboard, account explorer, and guide at 320, 375, 768,
1024, and 1440 CSS pixels. Check keyboard access, reduced motion, long addresses,
unavailable RPC data, zero balances, oversized inputs, and the interactive
educational example. Account balances must always come from contract reads.

For transaction changes, cover selected-token approval, sufficient allowance,
wallet rejection, account/network switching, reverted/cancelled transactions,
and refreshed account data. Automated transaction tests mock wallet/RPC calls;
they do not replace a funded Sepolia integration test.

Describe the behavior change and include validation evidence in the pull
request. Do not commit private keys, seed phrases, credentials, or `.env` files.
Do not request or expose anyone else's wallet secrets in bug reports.
