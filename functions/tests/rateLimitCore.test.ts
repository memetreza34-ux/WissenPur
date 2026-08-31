import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateFixedWindowRate } from '../src/rateLimitCore.js';

const windowMs = 60_000;
const maxActions = 12;

test('the first action starts a new fixed window', () => {
  assert.deepEqual(
    evaluateFixedWindowRate(0, 0, 1_000_000, windowMs, maxActions),
    {
      allowed: true,
      windowStartedAtMs: 1_000_000,
      count: 1,
      retryAfterMs: 0,
    },
  );
});

test('actions inside the same window increment up to the configured limit', () => {
  const decision = evaluateFixedWindowRate(
    1_000_000,
    11,
    1_030_000,
    windowMs,
    maxActions,
  );

  assert.equal(decision.allowed, true);
  assert.equal(decision.windowStartedAtMs, 1_000_000);
  assert.equal(decision.count, 12);
  assert.equal(decision.retryAfterMs, 0);
});

test('the action after the limit is blocked with a remaining wait time', () => {
  const decision = evaluateFixedWindowRate(
    1_000_000,
    12,
    1_045_000,
    windowMs,
    maxActions,
  );

  assert.equal(decision.allowed, false);
  assert.equal(decision.windowStartedAtMs, 1_000_000);
  assert.equal(decision.count, 12);
  assert.equal(decision.retryAfterMs, 15_000);
});

test('an expired window resets exactly at the boundary', () => {
  assert.deepEqual(
    evaluateFixedWindowRate(
      1_000_000,
      12,
      1_060_000,
      windowMs,
      maxActions,
    ),
    {
      allowed: true,
      windowStartedAtMs: 1_060_000,
      count: 1,
      retryAfterMs: 0,
    },
  );
});

test('clock reversal and malformed prior values start a safe new window', () => {
  assert.deepEqual(
    evaluateFixedWindowRate(
      2_000_000,
      Number.NaN,
      1_000_000,
      windowMs,
      maxActions,
    ),
    {
      allowed: true,
      windowStartedAtMs: 1_000_000,
      count: 1,
      retryAfterMs: 0,
    },
  );
});

test('invalid limiter configuration is rejected', () => {
  assert.throws(() =>
    evaluateFixedWindowRate(0, 0, 1_000, 0, maxActions),
  );
  assert.throws(() =>
    evaluateFixedWindowRate(0, 0, 1_000, windowMs, 0),
  );
  assert.throws(() =>
    evaluateFixedWindowRate(0, 0, Number.NaN, windowMs, maxActions),
  );
});
