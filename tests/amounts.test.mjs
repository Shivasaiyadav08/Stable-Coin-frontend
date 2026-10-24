import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatAmount,
  formatUsd,
  healthAfter,
  mintCapacity,
  parseAmount,
} from '../src/lib/amounts.ts';

test('accepts human amounts using the selected token decimals', () => {
  assert.equal(parseAmount('0.25', 18), 250000000000000000n);
  assert.equal(parseAmount('1.000001', 6), 1000001n);
  assert.equal(parseAmount('0.00000001', 8), 1n);
  assert.equal(parseAmount(' 2.5 ', 6), 2500000n);
});

test('rejects rounding, signs, exponents, zero, and uint256 overflow', () => {
  for (const value of ['0', '-1', '1e3', 'NaN', '.5', '1.0000001', '1,000'])
    assert.equal(parseAmount(value, 6), null);
  assert.equal(parseAmount((2n ** 256n).toString(), 0), null);
});

test('preserves exact large balances and distinguishes a tiny balance from zero', () => {
  assert.equal(formatAmount(123456789012345678901234567n, 6), '123,456,789,012,345,678,901.2345');
  assert.equal(formatAmount(0n, 18), '0');
  assert.equal(formatAmount(1n, 18), '<0.0001');
  assert.equal(formatUsd(123456789012345678901234567n), '$123,456,789.01');
});

test('capacity uses deployed parameters instead of an assumed 50% threshold', () => {
  const unit = 10n ** 18n;
  assert.equal(mintCapacity(1000n * unit, 100n * unit, 60n, 100n, unit, unit), 500n * unit);
  assert.equal(mintCapacity(1000n * unit, 100n * unit, 60n, 100n, unit, 2n * unit), 200n * unit);
  assert.equal(mintCapacity(100n * unit, 100n * unit, 50n, 100n, unit, unit), 0n);
});

test('mint capacity follows the engine integer rounding order', () => {
  assert.equal(mintCapacity(1n, 0n, 50n, 100n, 10n, 1n), 0n);
});

test('health distinguishes no debt, unsafe positions, and the mint boundary', () => {
  const unit = 10n ** 18n;
  assert.equal(healthAfter(0n, 0n, 50n, 100n, unit), null);
  assert.equal(healthAfter(0n, unit, 50n, 100n, unit), 0n);
  assert.equal(healthAfter(1000n * unit, 500n * unit, 50n, 100n, unit), unit);
  assert.equal(healthAfter(1000n * unit, 250n * unit, 50n, 100n, unit), 2n * unit);
});
