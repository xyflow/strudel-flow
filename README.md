# Strudel Flow

A visual drum machine and pattern sequencer built with [Strudel.cc](https://strudel.cc), [React Flow](https://reactflow.dev), and styled using [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/). Create complex musical patterns by connecting instrument nodes to effect nodes with a drag-and-drop interface.

## Play locally

```sh
pnpm install
pnpm dev
```

## Share your patch with us

Have you made something cool that you'd like others to use? Export your patch and [add it to `patches/`](patches/README.md) in a pull request. Accepted patches appear in the searchable community gallery.

## Adding new nodes

Want to add a new node? Strudel has endless features and combinations to explore, and we'd love if you wanted to help contribute to Strudel Flow. We've defined a small API to make it easy to turn them into nodes for everyone to use.

You provide the controls and the Strudel code. The app handles the menu entry, UI, and saved settings.

### Create a file

Add a file named `your-name.node.ts` inside `src/components/nodes/`:

- `instruments/` for nodes that create patterns.
- `sounds/` for nodes that choose sounds.
- `effects/` for nodes that modify patterns.

The app discovers `.node.ts` files automatically. No registry edits needed. A single-file node can live directly in its category folder; use a folder when you have several related files.

### Copy the boilerplate

Paste this into your file, then change it to match what you want to build:

```ts
import { defineNode } from '@/components/nodes/define-node';

export default defineNode({
  id: 'your-name-node',
  title: 'Your node',
  category: 'Audio Effects',
  icon: 'Waves',
  parameters: {
    amount: {
      control: 'knob',
      label: 'Amount',
      default: 0.3,
      min: 0,
      max: 1,
      step: 0.01,
    },
  },
  generate: ({ amount }, input) => (input ? `${input}.delay(${amount})` : ''),
});
```

This example adds a delay control. Replace `.delay(...)` with the Strudel code for your node, and add whatever parameters it needs.

### Customize your node

### Name and menu

- **`id`** is the unique identifier used in saved patches. Keep it stable once your node is published.
- **`title`** is the name people see.
- **`category`** is `'Instruments'`, `'Synths'` (displayed as Sounds), or `'Audio Effects'` (displayed as Effects).
- **`icon`** is a name from [icon-mapping.ts](../src/data/icon-mapping.ts).

### Controls

Each entry in `parameters` creates a control. Its key becomes a value you can use in `generate`.

- **`knob`** takes a numeric `default`, `min`, `max`, and `step`. You can also add a `unit` or `format(value)` function.
- **`text`** takes a string `default`.
- **`select`** takes a string `default` and an `options` array of `{ value, label }` entries.

All controls have a `label`. The app handles updating and saving their values.

### Strudel code

**`generate(values, input)`** returns a string of Strudel code. `values` contains your current parameter values; `input` contains the connected pattern.

Effects and sounds usually append to `input`. Instruments create a pattern of their own. For example, an instrument could use:

```ts
parameters: {
  notes: { control: 'text', label: 'Notes', default: 'c4 e4 g4' },
},
generate: ({ notes }) => `note(${JSON.stringify(notes)})`,
```

### Custom interfaces

Need a grid, keyboard, or something beyond the built-in controls? All you need to do is pass a React **`component`**.

## Acknowledgments

- [Strudel.cc](https://strudel.cc)
- [tweakcn](https://tweakcn.com)
- [React Flow](https://reactflow.dev)
- [shadcn/ui](https://ui.shadcn.com)

## Contact Us

We’re here to help! If you have any questions, feedback, instrument recommendations, or just want to share your project with us, feel free to reach out:

- **Contact Form**: Use the contact form on our [website](https://xyflow.com/contact).
- **Email**: Drop us an email at [info@xyflow.com](mailto:info@xyflow.com).
- **Discord**: Join our [Discord server](https://discord.com/invite/RVmnytFmGW) to connect with the community and get support.
