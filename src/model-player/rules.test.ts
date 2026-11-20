import { describe, expect, it } from 'vitest';
import { nodeDefinitions } from '@/components/nodes/registry';
import { applyPart } from './apply';
import { codeSpecs, effectSpecs, nodesWithoutSpec } from './registry';
import { EXAMPLE_PART, rulesDocument } from './rules';

describe('model player rules', () => {
  it('covers every node type', () => {
    // A new or changed node needs a *.code.ts file (or knob/select controls
    // only) before models can be told how to write it. See spec.ts.
    expect(nodesWithoutSpec).toEqual([]);
    expect(Object.keys(codeSpecs).sort()).toEqual(
      Object.keys(nodeDefinitions).sort(),
    );
  });

  it('gives every effect call one meaning', () => {
    const names = effectSpecs.flatMap((spec) => spec.methods.map((m) => m.name));
    expect(new Set(names).size).toBe(names.length);
    expect(names).not.toContain('sound');
    expect(names).not.toContain('s');
    for (const name of names) expect(name).toMatch(/^[A-Za-z_$][\w$]*$/);
  });

  it('only shows examples that work', () => {
    const blocks = [...rulesDocument().matchAll(/```js\n([\s\S]*?)```/g)];
    expect(blocks.length).toBeGreaterThan(2);
    for (const [, block] of blocks) {
      for (const line of block.split('\n').filter((l) => l.trim())) {
        const code = line.trim().startsWith('//') || line.startsWith('$:')
          ? line
          : `$: ${line}`;
        expect(() =>
          applyPart({ nodes: [], edges: [] }, 'me', code, 'setcpm(120/4)'),
        ).not.toThrow();
      }
    }
    const result = applyPart(
      { nodes: [], edges: [] },
      'me',
      EXAMPLE_PART,
      'setcpm(120/4)',
    );
    expect(result.code).toBe(EXAMPLE_PART);
  });

  it('matches the checked-in copy (update with `pnpm test -u`)', async () => {
    await expect(rulesDocument()).toMatchFileSnapshot(
      '../../docs/model-player-rules.md',
    );
  });
});
