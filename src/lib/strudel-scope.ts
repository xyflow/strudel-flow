import { Pattern, analysers, drawTimeScope } from '@strudel/web';
Pattern.prototype._scope = function ({ id = 1 } = {}) {
  return this.analyze(id);
};
Pattern.prototype._tscope = Pattern.prototype._scope;

export function drawScope(
  ctx: CanvasRenderingContext2D,
  id: string,
  scale: number,
  playing: boolean,
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawTimeScope(playing ? analysers[id] : undefined, {
    id,
    ctx,
    scale,
    pos: 0.5,
    color: getComputedStyle(ctx.canvas).color,
  });
}
