let _schedulerNow: (() => number) | null = null;

export function setSchedulerNow(fn: () => number) {
  _schedulerNow = fn;
}

/** Returns the current cycle position (monotonically increasing, fractional part = position within cycle). */
export function getSchedulerNow(): number {
  return _schedulerNow?.() ?? 0;
}
