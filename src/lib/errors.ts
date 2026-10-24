import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from 'viem';

const contractErrors: Record<string, string> = {
  DSCEngine__BreaksHealthFactor:
    'This would put the position below the required health factor. Reduce the amount or add collateral.',
  DSCEngine__HealthFactorNotImproved:
    'This liquidation would not improve the position. Try a different amount.',
  DSCEngine__HealthFactorOk: 'This position is healthy and cannot be liquidated.',
  DSCEngine__TokenNotAllowed: 'This collateral token is not supported by the protocol.',
  DSCEngine__NeedsMoreThanZero: 'Enter an amount greater than zero.',
  DSCEngine__TransferFailed: 'The token transfer failed. Check your balance and allowance.',
  DSCEngine__MintFailed: 'The protocol could not mint DSC. Review your position and try again.',
};

export function errorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    if (
      error.walk((cause) => cause instanceof UserRejectedRequestError) instanceof
      UserRejectedRequestError
    ) {
      return 'You declined the wallet request. Your inputs have been kept.';
    }
    const reverted = error.walk((cause) => cause instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      return (
        contractErrors[reverted.data?.errorName ?? ''] ??
        'The contract rejected this action. Check the amount, balance, and position health.'
      );
    }
  }
  const message = error instanceof Error ? error.message : '';
  if (/reject|denied/i.test(message))
    return 'You declined the wallet request. Your inputs have been kept.';
  if (/insufficient funds/i.test(message))
    return 'There is not enough Sepolia ETH to pay the network fee.';
  if (/timeout|timed out/i.test(message))
    return 'Confirmation is taking longer than expected. Check the transaction link before submitting again.';
  if (/account changed|network changed|cancelled|replaced/i.test(message)) return message;
  if (/HTTP|fetch|network|RPC|socket/i.test(message))
    return 'The network could not be reached. Please retry in a moment.';
  return 'The request could not be completed. Check your network, balance, and inputs, then retry.';
}
