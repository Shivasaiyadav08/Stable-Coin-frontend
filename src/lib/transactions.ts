import { erc20Abi, type Abi, type Address, type Hash } from 'viem';
import type { Config } from 'wagmi';
import {
  getAccount,
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions';
import { chain, engineAbi, engineAddress } from './contracts.ts';

export type TransactionRequest = {
  account: Address;
  label: string;
  functionName: 'depositCollateral' | 'mintDsc' | 'burnDsc' | 'redeemCollateral' | 'liquidate';
  args: readonly (Address | bigint)[];
  approval?: { token: Address; amount: bigint; symbol: string };
};

export type TransactionProgress = {
  stage: 'approval' | 'signature' | 'pending' | 'success' | 'error';
  message: string;
  hash?: Hash;
  approvalHash?: Hash;
};

// Kept outside React so transaction sequencing can be tested without a real wallet.
export async function sendTransaction(
  config: Config,
  request: TransactionRequest,
  report: (progress: Partial<TransactionProgress>) => void,
) {
  function checkWallet() {
    const wallet = getAccount(config);
    if (wallet.address?.toLowerCase() !== request.account.toLowerCase())
      throw new Error('The wallet account changed. Review the action and submit again.');
    if (wallet.chainId !== chain.id)
      throw new Error('The wallet network changed. Switch to Sepolia and submit again.');
  }

  async function confirm(hash: Hash, approval = false) {
    let replacementReason: string | undefined;
    const receipt = await waitForTransactionReceipt(config, {
      chainId: chain.id,
      hash,
      timeout: 180_000,
      onReplaced: (replacement) => {
        replacementReason = replacement.reason;
        report({
          [approval ? 'approvalHash' : 'hash']: replacement.transactionReceipt.transactionHash,
        });
      },
    });
    if (replacementReason === 'cancelled')
      throw new Error('The transaction was cancelled in your wallet.');
    if (replacementReason === 'replaced')
      throw new Error(
        'The transaction was replaced by a different action. Check its explorer link before continuing.',
      );
    if (receipt.status !== 'success') throw new Error('Transaction reverted');
  }

  checkWallet();
  report({ stage: 'signature', message: 'Checking the transaction…' });
  if (request.approval) {
    const { token, amount, symbol } = request.approval;
    const allowance = await readContract(config, {
      chainId: chain.id,
      address: token,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [request.account, engineAddress],
    });
    if (allowance < amount) {
      checkWallet();
      report({
        stage: 'approval',
        message: `Step 1 of 2 · Approve ${symbol} spending. Only the required amount is requested.`,
      });
      const approval = await simulateContract(config, {
        chainId: chain.id,
        account: request.account,
        address: token,
        abi: erc20Abi,
        functionName: 'approve',
        args: [engineAddress, amount],
      });
      if (approval.result === false) throw new Error('Token approval was refused');
      checkWallet();
      const approvalHash = await writeContract(config, approval.request);
      report({
        approvalHash,
        message: `Step 1 of 2 · Waiting for ${symbol} approval confirmation…`,
      });
      await confirm(approvalHash, true);
    }
  }

  checkWallet();
  report({
    stage: 'signature',
    message: 'Review and confirm the protocol transaction in your wallet.',
  });
  const simulation = await simulateContract(config, {
    chainId: chain.id,
    account: request.account,
    address: engineAddress,
    abi: engineAbi as Abi,
    functionName: request.functionName,
    args: request.args,
  });
  checkWallet();
  const hash = await writeContract(config, simulation.request);
  report({
    stage: 'pending',
    hash,
    message: 'Submitted to Sepolia. Waiting for on-chain confirmation…',
  });
  await confirm(hash);
}
