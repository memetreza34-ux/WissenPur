export interface FixedWindowRateState {
  windowStartedAtMs: number;
  count: number;
}

export interface FixedWindowRateDecision extends FixedWindowRateState {
  allowed: boolean;
  retryAfterMs: number;
}

export const evaluateFixedWindowRate = (
  previousWindowStartedAtMs: number,
  previousCount: number,
  nowMs: number,
  windowMs: number,
  maxActions: number,
): FixedWindowRateDecision => {
  if (
    !Number.isFinite(nowMs) ||
    !Number.isFinite(windowMs) ||
    !Number.isInteger(maxActions) ||
    windowMs <= 0 ||
    maxActions < 1
  ) {
    throw new Error('Invalid fixed-window rate-limit configuration.');
  }

  const safePreviousWindow = Number.isFinite(previousWindowStartedAtMs)
    ? Math.max(0, previousWindowStartedAtMs)
    : 0;
  const safePreviousCount = Number.isInteger(previousCount)
    ? Math.max(0, previousCount)
    : 0;
  const sameWindow =
    safePreviousWindow > 0 &&
    nowMs >= safePreviousWindow &&
    nowMs - safePreviousWindow < windowMs;

  if (!sameWindow) {
    return {
      allowed: true,
      windowStartedAtMs: nowMs,
      count: 1,
      retryAfterMs: 0,
    };
  }

  if (safePreviousCount >= maxActions) {
    return {
      allowed: false,
      windowStartedAtMs: safePreviousWindow,
      count: safePreviousCount,
      retryAfterMs: Math.max(1, windowMs - (nowMs - safePreviousWindow)),
    };
  }

  return {
    allowed: true,
    windowStartedAtMs: safePreviousWindow,
    count: safePreviousCount + 1,
    retryAfterMs: 0,
  };
};
