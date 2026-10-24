import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const account = '0x1111111111111111111111111111111111111111';
const token = '0x2222222222222222222222222222222222222222';
const dsc = '0x3333333333333333333333333333333333333333';
const hash = `0x${'ab'.repeat(32)}`;
let allowance, wallet, calls, receiptStatus, replaceReason, changeAfterApproval;

mock.module('wagmi/actions', {
  namedExports: {
    getAccount: () => wallet,
    readContract: async (_config, request) => {
      calls.push(['read', request]);
      return allowance;
    },
    simulateContract: async (_config, request) => {
      calls.push(['simulate', request]);
      return { request, result: true };
    },
    writeContract: async (_config, request) => {
      calls.push(['write', request]);
      return hash;
    },
    waitForTransactionReceipt: async (_config, request) => {
      calls.push(['receipt', request]);
      if (replaceReason)
        request.onReplaced({
          reason: replaceReason,
          transactionReceipt: { transactionHash: hash },
        });
      if (changeAfterApproval) wallet = { ...wallet, address: token };
      return { status: receiptStatus };
    },
  },
});
const { sendTransaction } = await import('../src/lib/transactions.ts');

beforeEach(() => {
  allowance = 0n;
  wallet = { address: account, chainId: 11155111 };
  calls = [];
  receiptStatus = 'success';
  replaceReason = undefined;
  changeAfterApproval = false;
});

test('approves the selected collateral, waits for it, then deposits on the same chain', async () => {
  const amount = 25000000n;
  await sendTransaction(
    {},
    {
      account,
      label: 'Deposit',
      functionName: 'depositCollateral',
      args: [token, amount],
      approval: { token, amount, symbol: 'TOKEN' },
    },
    () => {},
  );
  const writes = calls.filter(([type]) => type === 'write').map(([, request]) => request);
  assert.equal(writes[0].address, token);
  assert.equal(writes[0].args[1], amount);
  assert.deepEqual(writes[1].args, [token, amount]);
  assert.deepEqual(
    calls.map(([type]) => type),
    ['read', 'simulate', 'write', 'receipt', 'simulate', 'write', 'receipt'],
  );
  for (const [, request] of calls) assert.equal(request.chainId, 11155111);
});

test('liquidation approves the DSC debt, not collateral received', async () => {
  const debt = 100n * 10n ** 18n;
  await sendTransaction(
    {},
    {
      account,
      label: 'Liquidate',
      functionName: 'liquidate',
      args: [token, account, debt],
      approval: { token: dsc, amount: debt, symbol: 'DSC' },
    },
    () => {},
  );
  const approval = calls.find(([type]) => type === 'write')[1];
  assert.equal(approval.address, dsc);
  assert.equal(approval.args[1], debt);
});

test('skips an approval when the existing allowance is sufficient', async () => {
  allowance = 100n;
  await sendTransaction(
    {},
    {
      account,
      label: 'Repay',
      functionName: 'burnDsc',
      args: [10n],
      approval: { token: dsc, amount: 10n, symbol: 'DSC' },
    },
    () => {},
  );
  assert.equal(calls.filter(([type]) => type === 'write').length, 1);
});

test('refuses an unsupported chain before any allowance or signature request', async () => {
  wallet.chainId = 1;
  await assert.rejects(
    sendTransaction({}, { account, label: 'Mint', functionName: 'mintDsc', args: [1n] }, () => {}),
    /network changed/,
  );
  assert.equal(calls.length, 0);
});

test('account changes during approval prevent the protocol transaction', async () => {
  changeAfterApproval = true;
  await assert.rejects(
    sendTransaction(
      {},
      {
        account,
        label: 'Deposit',
        functionName: 'depositCollateral',
        args: [token, 1n],
        approval: { token, amount: 1n, symbol: 'TOKEN' },
      },
      () => {},
    ),
    /account changed/,
  );
  assert.equal(calls.filter(([type]) => type === 'write').length, 1);
});

test('cancelled and reverted receipts never complete as success', async () => {
  const request = { account, label: 'Mint', functionName: 'mintDsc', args: [1n] };
  replaceReason = 'cancelled';
  await assert.rejects(
    sendTransaction({}, request, () => {}),
    /cancelled/,
  );
  replaceReason = 'replaced';
  await assert.rejects(
    sendTransaction({}, request, () => {}),
    /replaced/,
  );
  replaceReason = undefined;
  receiptStatus = 'reverted';
  await assert.rejects(
    sendTransaction({}, request, () => {}),
    /reverted/,
  );
});
