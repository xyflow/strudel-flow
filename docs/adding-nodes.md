# Add a node

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
      control: 'knob',
      label: 'Mix',
      default: 0.3,
      min: 0,
      max: 1,
      step: 0.01,
    },
  },
  generate: ({ wet }, input) => (input ? `${input}.delay(${wet})` : ''),
});
```

That's it. The app adds the menu entry, controls, and saved state automatically.

Run `pnpm dev`, add **Delay** from the Effects menu, and connect it after an instrument and sound. Press **Space** and try the knob.

## Make it yours

- Give it a unique `id` and a title.
- `parameters` creates the controls: `knob`, `text`, or `select`.
- `generate` returns Strudel code. For effects, append to the incoming `input`.

For an **instrument**, put the file in `nodes/instruments`, use `category: 'Instruments'`, and return a pattern such as `note("c4 e4 g4")` without using `input`. For sounds, use `nodes/sounds` and `category: 'Synths'` (shown as Sounds).

Need a custom interface? Add a React `component` that uses `values` and `onChange`. See [the Code node](../src/components/nodes/instruments/custom/custom.node.ts) for a small example. Keep related files together in a folder.

See [define-node.ts](../src/components/nodes/define-node.ts) for all options. Quote user-entered text with `JSON.stringify` when inserting it into generated code.

## Contribute

Check playback, control edits, mute, and saving/reloading a patch. Run `pnpm build` and `pnpm lint`, then open a pull request.
