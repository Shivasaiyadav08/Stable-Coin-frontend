import test from 'node:test';
import assert from 'node:assert/strict';
import { positionRisk } from '../src/lib/risk.ts';

test('no debt is different from an unsafe zero health factor', () => {
  assert.equal(positionRisk(0n, 1000n, false).label, 'No debt');
  assert.equal(positionRisk(0n, 1000n, true).label, 'Liquidatable');
});

test('only values below the contract minimum are liquidatable', () => {
  assert.equal(positionRisk(999n, 1000n, true).tone, 'danger');
  assert.equal(positionRisk(1000n, 1000n, true).label, 'Meets minimum');
  assert.equal(positionRisk(1000n, 1000n, true).tone, 'healthy');
  assert.equal(positionRisk(1249n, 1000n, true).tone, 'healthy');
  assert.equal(positionRisk(1250n, 1000n, true).tone, 'healthy');
});

test('the risk display respects a different minimum without changing the model', () => {
  assert.equal(positionRisk(1999n, 2000n, true).tone, 'danger');
  assert.equal(positionRisk(2000n, 2000n, true).tone, 'healthy');
  assert.equal(positionRisk(2400n, 2000n, true).tone, 'healthy');
  assert.equal(positionRisk(3000n, 2000n, true).tone, 'healthy');
});
