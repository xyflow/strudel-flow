// Keeps the local Strudel scheduler on the same cycle as the room's shared
// transport, so both players are on the same bar.
//
// How Strudel's Cyclist works (@strudel/core cyclist.mjs): every tick queries
// the pattern from `lastEnd` onward. When `num_ticks_since_cps_change` is 0,
// the next tick re-anchors: the cycle `lastEnd` is mapped to that tick's audio
// time (`clock.getPhase()`), and haps are scheduled `latency` seconds later.
// So to jump to cycle X at the next tick, we set lastEnd = X and reset the tick
// counter. This is internal API; it was checked against @strudel/core 1.2.2.
import { cycleAt, type Transport } from './binding';
import type { ServerClock } from './clock';

export type SchedulerInternals = {
  started: boolean;
  cps: number;
  lastEnd: number;
  latency: number;
  num_ticks_since_cps_change: number;
  clock: { getPhase(): number };
};

/** Map an AudioContext time to performance.now() time at the speaker. */
function audioTimeToPerf(ctx: AudioContext, audioTime: number): number {
  const stamp = ctx.getOutputTimestamp?.();
  if (stamp?.performanceTime && stamp.contextTime !== undefined) {
    return stamp.performanceTime + (audioTime - stamp.contextTime) * 1000;
  }
  const outputLatency = ctx.outputLatency || ctx.baseLatency || 0;
  return (
    performance.now() + (audioTime - ctx.currentTime + outputLatency) * 1000
  );
}

function desiredCycle(
  transport: Transport,
  ctx: AudioContext,
  clock: ServerClock,
  audioTime: number,
) {
  return cycleAt(transport, clock.perfToServer(audioTimeToPerf(ctx, audioTime)));
}

/** Before the scheduler starts, point it at the cycle the room is on. */
export function prepareStart(
  scheduler: SchedulerInternals,
  transport: Transport,
  ctx: AudioContext,
  clock: ServerClock,
) {
  if (scheduler.started || !transport.playing) return;
  // The clock's first tick happens getTime() + 10 ms after start().
  scheduler.lastEnd = desiredCycle(
    transport,
    ctx,
    clock,
    ctx.currentTime + 0.01 + scheduler.latency,
  );
  scheduler.num_ticks_since_cps_change = 0;
}

export function createAligner({
  smallErrorMs = 20,
  bigErrorMs = 100,
}: { smallErrorMs?: number; bigErrorMs?: number } = {}) {
  let strikes = 0;
  return {
    /**
     * Measure how far the scheduler is from the room's cycle and correct it.
     * Returns the error in ms before correction, or null if not measurable.
     * Big errors are fixed at once. Small ones must show up twice in a row, so
     * clock-estimate jitter doesn't cause audible jumps.
     */
    check(
      scheduler: SchedulerInternals,
      transport: Transport,
      ctx: AudioContext,
      clock: ServerClock,
    ): number | null {
      if (!transport.playing || !scheduler.started) return null;
      // Wait until the re-evaluated code has applied the new tempo.
      if (Math.abs(scheduler.cps - transport.cps) > 1e-9) return null;
      const phase = scheduler.clock.getPhase();
      if (!phase) return null;
      const target = desiredCycle(
        transport,
        ctx,
        clock,
        phase + scheduler.latency,
      );
      const errorMs = ((target - scheduler.lastEnd) / transport.cps) * 1000;
      const size = Math.abs(errorMs);
      strikes = size > smallErrorMs ? strikes + 1 : 0;
      if (size > bigErrorMs || strikes >= 2) {
        scheduler.lastEnd = target;
        scheduler.num_ticks_since_cps_change = 0;
        strikes = 0;
      }
      return errorMs;
    },
    reset() {
      strikes = 0;
    },
  };
}
