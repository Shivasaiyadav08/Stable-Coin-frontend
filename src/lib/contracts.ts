import { parseAbi } from 'viem';
import { sepolia } from 'wagmi/chains';

// Only list networks that have a known deployment. Local Anvil addresses differ.
export const chain = sepolia;
export const engineAddress = '0xE7346418690ED8e133B145D236daC9A48c8C269c' as const;
export const repositoryUrl = 'https://github.com/Shivasaiyadav08/Stable-Coin-frontend';
export const contractsRepositoryUrl = 'https://github.com/Shivasaiyadav08/Stable-Coin';
export const educationalSourceUrl = 'https://github.com/Cyfrin/foundry-defi-stablecoin-cu';
export const dscAddress = '0xE9543340546545d8f3ab470d00c809D37f364B7A' as const;
export const testnetDisclaimer =
  'DSC is an educational testnet stablecoin prototype. Its target USD peg is not guaranteed. Do not treat it as an audited, production financial protocol.';

export const engineAbi = parseAbi([
  'function getDsc() view returns (address)',
  'function getCollateralTokens() view returns (address[])',
  'function getAccountInformation(address user) view returns (uint256 debt, uint256 collateralUsd)',
  'function getHealthFactor(address user) view returns (uint256)',
  'function getCollateralBalanceOfUser(address user, address token) view returns (uint256)',
  'function getLiquidationThreshold() pure returns (uint256)',
  'function getLiquidationPrecision() pure returns (uint256)',
  'function getLiquidationBonus() pure returns (uint256)',
  'function getMinHealthFactor() pure returns (uint256)',
  'function getPrecision() pure returns (uint256)',
  'function getUsdValue(address token, uint256 amount) view returns (uint256)',
  'function getTokenAmountFromUsd(address token, uint256 usdAmount) view returns (uint256)',
  'function depositCollateral(address token, uint256 amount)',
  'function mintDsc(uint256 amount)',
  'function burnDsc(uint256 amount)',
  'function redeemCollateral(address token, uint256 amount)',
  'function liquidate(address collateral, address user, uint256 debtToCover)',
  'error DSCEngine__BreaksHealthFactor(uint256 healthFactorValue)',
  'error DSCEngine__HealthFactorNotImproved()',
  'error DSCEngine__HealthFactorOk()',
  'error DSCEngine__MintFailed()',
  'error DSCEngine__NeedsMoreThanZero()',
  'error DSCEngine__TokenNotAllowed(address token)',
  'error DSCEngine__TransferFailed()',
]);

export function explorerAddress(address: string) {
  return `${chain.blockExplorers.default.url}/address/${address}`;
}

export function explorerTransaction(hash: string) {
  return `${chain.blockExplorers.default.url}/tx/${hash}`;
}
