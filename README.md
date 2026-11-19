# Strudel Together

Jam remotely on one [Strudel](https://strudel.cc) piece in a node graph. Everyone in a room hears the combined mix, in time, but each player only sees their own nodes.

Source: [msandlerespi/strudel-flow-together](https://github.com/msandlerespi/strudel-flow-together), a fork of [xyflow/strudel-flow](https://github.com/xyflow/strudel-flow) with a small room server. AGPL-3.0, like Strudel and strudel-flow. If you host it for other people, link them to your source.

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

## Deploying on Render

`render.yaml` is a Render Blueprint that sets up both parts, both on free plans:

- **strudel-together**: the app, as a static site. It's served from Render's CDN and never sleeps.
- **strudel-together-rooms**: the room server, a web service built from `server/Dockerfile`. The room server needs a long-running process with open WebSockets, which is why it isn't a static or serverless host.

1. In the Render dashboard choose *New → Blueprint* and pick this repo.
2. Render asks for two values:
   - `VITE_COLLAB_URL`: the room server's address. Enter `https://strudel-together-rooms.onrender.com` (`wss://` works too).
   - `VITE_SOURCE_URL`: this repo's public URL. The About panel links to it, as the AGPL requires.
3. After the first deploy, open the room server's page in the dashboard and check its URL. If Render added a suffix because the name was taken, set `VITE_COLLAB_URL` on the static site to the real URL and redeploy the static site. Vite bakes both values into the build, so any change needs a redeploy.

**Free-plan behaviour.** The room server sleeps after 15 idle minutes and takes about a minute to wake; the join screen says so and keeps retrying. It has no disk, so a room is lost once everyone has left and the server sleeps or restarts. While anyone has the room open, their browser restores it to a restarted server. For durable rooms, use a paid plan with a disk mounted at `/data`.

Any other host works too: put `dist/` on a static host, with `VITE_COLLAB_URL` set at build time, and run `server/Dockerfile` (or `node server/index.ts` on Node 22.18+) anywhere that supports WebSockets. The server reads `PORT` and `DB_PATH`.

## Adding nodes

Nodes are discovered automatically: add a `your-name.node.ts` file under `src/components/nodes/` (`instruments/` create patterns, `sounds/` choose sounds, `effects/` modify the incoming pattern). No registry edits are needed.

```ts
import { defineNode } from '@/components/nodes/define-node';

export default defineNode({
  id: 'your-name-node',
  title: 'Your node',
  category: 'Audio Effects',
  icon: 'Waves',
  parameters: {
    amount: { control: 'knob', label: 'Amount', default: 0.3, min: 0, max: 1, step: 0.01 },
  },
  generate: ({ amount }, input) => (input ? `${input}.delay(${amount})` : ''),
});
```

`generate(values, input)` returns Strudel code. `values` holds the current parameter values and `input` the connected pattern. Effects usually append to `input`; instruments return a pattern of their own. For controls beyond knobs, text fields and selects (a grid, a keyboard), pass a React `component`. Node data syncs to the room automatically.

## Credits

- [Strudel](https://strudel.cc): the live-coding music engine (AGPL-3.0).
- [Strudel Flow](https://github.com/xyflow/strudel-flow) by xyflow: the node-graph app this is forked from.
- [React Flow](https://reactflow.dev), [shadcn/ui](https://ui.shadcn.com), [tweakcn](https://tweakcn.com) themes, [Yjs](https://yjs.dev) and [Hocuspocus](https://github.com/ueberdosis/hocuspocus).
