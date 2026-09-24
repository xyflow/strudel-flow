export type PhaserData = { phaser?: string; phaserdepth?: string };

export const DEFAULTS = { phaser: 1, phaserdepth: 0.5 };

export function generatePattern(data: PhaserData, strudelString: string) {
  const phaser = data.phaser;
  const phaserdepth = data.phaserdepth;

  if (!phaser || !phaserdepth) return strudelString;

  const phaserCall = `phaser(${phaser}).phaserdepth(${phaserdepth})`;
  return strudelString ? `${strudelString}.${phaserCall}` : phaserCall;
}
