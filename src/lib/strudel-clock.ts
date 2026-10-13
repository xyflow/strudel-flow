let _schedulerNow: (() => number) | null = null;

export function setSchedulerNow(fn: () => number) {
  _schedulerNow = fn;
}
export function getSchedulerNow(): number {
  return _schedulerNow?.() ?? 0;
}
