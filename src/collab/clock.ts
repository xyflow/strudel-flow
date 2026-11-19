// Server clock estimate, NTP-style.
// Send a burst of pings; for each pong, offset = serverTs - (t0 + t1) / 2.
// The sample with the smallest round trip has the least asymmetric delay,
// so it gives the best offset estimate.
export type ClockStats = { synced: boolean; offsetMs: number; rttMs: number };

type Sample = { rtt: number; offset: number };

export function createServerClock({
  burstSize = 8,
  burstSpacingMs = 60,
  burstEveryMs = 15000,
  window = 24,
  onStats,
}: {
  burstSize?: number;
  burstSpacingMs?: number;
  burstEveryMs?: number;
  window?: number;
  onStats?: (stats: ClockStats) => void;
} = {}) {
  // Until the first pong, fall back to the local wall clock.
  let offset = Date.now() - performance.now();
  let best: Sample | null = null;
  const samples: Sample[] = [];
  let send: ((payload: string) => void) | null = null;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let interval: ReturnType<typeof setInterval> | undefined;

  function burst() {
    for (let i = 0; i < burstSize; i++) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        send?.(JSON.stringify({ type: 'ping', t0: performance.now() }));
      }, i * burstSpacingMs);
      timers.add(timer);
    }
  }

  return {
    /** Feed every stateless payload from the server through here. */
    handle(payload: string) {
      let message: { type?: string; t0?: number; ts?: number };
      try {
        message = JSON.parse(payload);
      } catch {
        return;
      }
      if (
        message.type !== 'pong' ||
        typeof message.t0 !== 'number' ||
        typeof message.ts !== 'number'
      )
        return;
      const t1 = performance.now();
      samples.push({
        rtt: t1 - message.t0,
        offset: message.ts - (message.t0 + t1) / 2,
      });
      if (samples.length > window) samples.shift();
      best = samples.reduce((a, b) => (b.rtt < a.rtt ? b : a));
      offset = best.offset;
      onStats?.({ synced: true, offsetMs: offset, rttMs: best.rtt });
    },
    start(sender: (payload: string) => void) {
      send = sender;
      burst();
      interval = setInterval(burst, burstEveryMs);
    },
    stop() {
      send = null;
      clearInterval(interval);
      timers.forEach(clearTimeout);
      timers.clear();
    },
    /** Current server time in ms. */
    now() {
      return performance.now() + offset;
    },
    /** Convert a performance.now() timestamp to server time. */
    perfToServer(perfMs: number) {
      return perfMs + offset;
    },
    get synced() {
      return best !== null;
    },
  };
}

export type ServerClock = ReturnType<typeof createServerClock>;
