import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  encodeErrorResult,
} from 'viem';
import { errorMessage } from '../src/lib/errors.ts';

test('wallet rejection stays an error even when wrapped by the wallet library', () => {
  const error = new BaseError('Request failed', {
    cause: new UserRejectedRequestError(new Error('Rejected')),
  });
  assert.match(errorMessage(error), /declined/);
});

test('decodes protocol failures into an actionable health-factor message', () => {
  const abi = [{ type: 'error', name: 'DSCEngine__HealthFactorOk', inputs: [] }];
  const data = encodeErrorResult({ abi, errorName: 'DSCEngine__HealthFactorOk' });
  const error = new ContractFunctionRevertedError({ abi, data, functionName: 'liquidate' });
  assert.match(errorMessage(error), /healthy and cannot be liquidated/i);
});

test('does not expose RPC URLs or raw stack traces in public feedback', () => {
  assert.match(
    errorMessage(new Error('HTTP request failed https://rpc.example/secret')),
    /network could not be reached/i,
  );
  assert.doesNotMatch(
    errorMessage(new Error('HTTP request failed https://rpc.example/secret')),
    /secret/,
  );
  assert.match(errorMessage(new Error('insufficient funds for gas')), /Sepolia ETH/);
  assert.match(errorMessage(new Error('timed out')), /before submitting again/);
});

test('a wallet network change keeps its specific recovery instructions', () => {
  const message = 'The wallet network changed. Switch to Sepolia and submit again.';
  assert.equal(errorMessage(new Error(message)), message);
});
