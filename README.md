# Strudel Together

Jam remotely on one [Strudel](https://strudel.cc) piece in a node graph. Everyone in a room hears the combined mix, in time, but each player only sees their own nodes.

A fork of [xyflow/strudel-flow](https://github.com/xyflow/strudel-flow) with a small room server. AGPL-3.0, like Strudel and strudel-flow. If you host it for other people, link them to your source.

## Run it locally

You need Node 22.18 or later. pnpm is pinned in `package.json`; `npx pnpm@9.11.0` works if pnpm isn't installed.

```sh
pnpm install
pnpm --dir server install
pnpm server   # room server on ws://localhost:1234 (rooms saved in data/rooms.sqlite)
pnpm dev      # app on http://localhost:5173
```

Open the app, click the people icon, then **Start a room**, and send the link. To try two players on one machine, open `?room=test&as=Alice` and `?room=test&as=Bob` in two tabs.

## How it works

- **Sync.** Each room is a Yjs document on a [Hocuspocus](https://github.com/ueberdosis/hocuspocus) server (`server/index.ts`). `src/collab/binding.ts` diffs the app's Zustand store against the doc after every change, so every existing edit path syncs without changes.
- **Ownership.** Each node carries `data.owner`. The binding never writes or deletes another player's nodes. Loading a patch or pressing undo only touches your own part.
- **Hidden view.** The canvas, the code panel, exports and share links show only your nodes. Audio is compiled from everyone's nodes, so you hear the whole piece. This is UI-level hiding: the data does reach both browsers. The room toggle "Hide each other's work" switches to a fully shared canvas.
- **Same bar on both machines.** Play/stop and tempo are shared. `src/collab/clock.ts` estimates the server clock NTP-style, and `src/collab/align.ts` keeps Strudel's scheduler on the room's cycle (anchor time + cps), correcting drift over 20 ms.
- **Trust.** The Code node runs your partner's Strudel/JS in your browser. Only jam with people you trust; room ids are unguessable.

## Tests

```sh
pnpm test
```

## Deploying

- Build the app (`pnpm build`) and host `dist/` on any static host. Set `VITE_COLLAB_URL` to your room server, e.g. `wss://rooms.example.com`.
- Run `node server/index.ts` on any host that supports WebSockets. It reads `PORT` and `DB_PATH`.

---

## Upstream: Strudel Flow

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
