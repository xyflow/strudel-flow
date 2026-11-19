declare module '@strudel/web' {
  export type StrudelSession = {
    // `now` is public; the rest are Cyclist internals used by
    // src/collab/align.ts to keep jam partners on the same cycle.
    scheduler: { now: () => number } & import('@/collab/align').SchedulerInternals;
    state: { evalError?: unknown };
  };

  export function initStrudel(): Promise<StrudelSession>;
  export function evaluate(code: string): Promise<unknown>;
  export function hush(): void;
  export function getAudioContext(): AudioContext;
  export function samples(source: string): Promise<unknown>;
  export function transpiler(
    code: string,
    options: { emitWidgets: boolean },
  ): unknown;

  export class Pattern {
    analyze(id: string | number): Pattern;
    _scope(options?: { id?: string | number }): Pattern;
    _tscope(options?: { id?: string | number }): Pattern;
  }

  export const analysers: Record<string, AnalyserNode | undefined>;
  export function drawTimeScope(
    analyser: AnalyserNode | undefined,
    options: {
      id: string;
      ctx: CanvasRenderingContext2D;
      scale: number;
      pos: number;
      color: string;
    },
  ): void;
}
