# Adding nodes

New nodes live in `src/components/nodes/` and export a default `defineNode(...)` from a file ending in `.node.ts` or `.node.tsx`. Vite discovers these files at build time. No registry entry or edit to the shared node data type is needed.

Every node uses this API. The registry discovers definitions automatically and contains no list of node imports. All effects except Scope use generated controls; custom instruments keep their UI and musical model alongside their definition.

Single-file effects live directly in `nodes/effects`. Nodes with a separate UI or musical model keep a folder for those related files.

## A simple effect

Create `src/components/nodes/effects/delay.node.ts`:

```ts
import { defineNode } from '../define-node';

export default defineNode({
  id: 'delay-node',
  title: 'Delay',
  category: 'Audio Effects',
  icon: 'Waves',
  parameters: {
    wet: {
      control: 'knob', label: 'Mix', default: 0.3,
      min: 0, max: 1, step: 0.01,
    },
  },
  generate: ({ wet }, input) => input ? `${input}.delay(${wet})` : '',
});
```

The definition supplies the menu entry, node shell, controls, initial values, and code generator. Knob values are inferred as numbers; text values are inferred as strings. The app stores values in patch data as strings for compatibility with existing patches. Missing parameters use their declared defaults when rendering and generating code.

Supported controls:

- `knob`: `label`, numeric `default`, `min`, `max`, `step`, and optional `unit`.
- `text`: `label` and string `default`.
- `select`: `label`, string `default`, and an `options` array of `{ value, label }` entries.

Knobs can provide `format(value)` for custom units. For old saved data formats, optional `read(data)` and `write(updates, data)` adapt stored fields to controls and back. Filter uses these to retain its packed `lpf` field. The generator also receives the original stored `data` in its third argument when a compatibility rule needs it.

Use `generateParameterEffects` as the generator when each numeric parameter's key matches a Strudel method. It appends only values different from the declared defaults. See `effects/level.node.ts` and `effects/texture.node.ts`.

## An instrument

Use `category: 'Instruments'` and generate a source pattern. The compiler combines connected sources and then applies their sound and effect nodes.

```ts
import { defineNode } from '../../define-node';

export default defineNode({
  id: 'melody-node',
  title: 'Melody',
  category: 'Instruments',
  icon: 'Music',
  parameters: {
    notes: { control: 'text', label: 'Notes', default: 'c4 e4 g4' },
  },
  generate: ({ notes }) => `note(${JSON.stringify(notes)}).sound("triangle")`,
});
```

Quote user-entered text with `JSON.stringify` when inserting it into generated code. Generators return code; they must not start audio or modify the store.

## Custom controls

For instruments that need more than knobs and text fields, use a `.node.tsx` file and provide `component`. It receives typed `values` and `onChange`; the app supplies the node shell and persistence.

```tsx
export default defineNode({
  id: 'note-toggle-node',
  title: 'Note toggle',
  category: 'Instruments',
  icon: 'Music',
  parameters: {
    note: { control: 'text', label: 'Note', default: 'c4' },
  },
  component: ({ values, onChange }) => (
    <button
      className="nodrag rounded bg-primary px-3 py-2 text-primary-foreground"
      onClick={() => onChange({ note: values.note === 'c4' ? 'g4' : 'c4' })}
    >
      {values.note}
    </button>
  ),
  generate: ({ note }) => `note(${JSON.stringify(note)}).sound("sine")`,
});
```

Import `defineNode` from the relative path to `nodes/define-node.ts` as in the earlier examples. Use `nodrag` on interactive controls, `nowheel` on scrollable content, and theme colors. Custom controls replace the automatic controls. For structured state, such as grids, chord arrays, or drum rows, provide a typed `defaults` object alongside `parameters`. Fields outside `parameters` are preserved as JSON values rather than converted to strings. For example:

```ts
type SequencerData = { steps?: boolean[] };

// Inside defineNode:
parameters: {},
defaults: {} as SequencerData,
component: SequencerControls,
generate: generateSequencerPattern,
```

Type the component with `CustomControlsProps<SequencerData>` from `define-node.ts`. It receives `values` and `onChange`, plus `id`, `isPlaying`, `isMuted`, and the connected group's `scopeId`. The app supplies the outer node shell, so custom controls should not wrap themselves in `WorkflowNode` or update the app store directly. See `instruments/beat-machine` for a complete example.

An empty typed defaults object is intentional for migrated instruments: their existing model functions handle missing fields and old patch formats. For a new instrument, declare its actual defaults here, and treat arrays and objects as immutable when updating them.

## Compatibility and checks

- Use a unique, stable `id`. Saved patches reference it; duplicate definitions fail at startup.
- Categories are `Instruments`, `Synths` (shown as Sounds), and `Audio Effects` (shown as Effects).
- Icons come from `src/data/icon-mapping.ts`. Optional numeric `order` controls menu position; otherwise new definitions follow the existing nodes, sorted by title.
- Avoid the reserved metadata parameter names `title`, `label`, `icon`, and `state`. Keep existing parameter names and defaults stable when updating a published node.
- Run `pnpm build` and `pnpm lint`. Verify menu discovery, default playback, control edits, mute, and saving/reloading a patch. Check that existing patches still produce the same sound.

Treat different settings of existing nodes as example patches, rather than adding a new node for every variation.
