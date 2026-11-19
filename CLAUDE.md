# Strudel Together

Remote jam rooms for a Strudel node-graph app. A fork of xyflow/strudel-flow. Players share one room, each sees only their own nodes, and everyone hears the full mix, in time. AGPL-3.0.

Stack: Vite 5, React 19, @xyflow/react 12, Zustand 5, Yjs, Hocuspocus 4 (room server), `@strudel/web` 1.2.3. Deployed on Render from `main`.

## Commands
pnpm is pinned. On this machine (Node 26, no corepack) use `npx -y pnpm@9.11.0 <cmd>`:
- `install`, then `install --dir server` for the room server
- `server`: room server on ws://localhost:1234, saves rooms to `data/rooms.sqlite`
- `dev`: app on http://localhost:5173. It reaches the room server through the `/collab` proxy in `vite.config.js`.
- `test` (vitest), `lint` (eslint), `build` (`tsc && vite build`)
- Render's exact build, so run this before pushing: `npx -y pnpm@9.11.0 install --frozen-lockfile && npx -y pnpm@9.11.0 build`

## Map
- `src/collab/binding.ts`: two-way binding between the Zustand store and a Y.Doc. It **diffs the store** after every change, so every existing edit path syncs. Don't route mutations through it.
- `src/collab/ownership.ts`: `data.owner` on nodes and edges, `visibleGraph`, `mergeOwnGraph` (undo), `adoptGraph` (fresh ids when loading a patch).
- `src/collab/session.ts`: Hocuspocus provider, collab UI store, `joinRoom`, `collabServerUrl()`.
- `src/collab/clock.ts` + `align.ts`: NTP-style server clock. Keeps Strudel's Cyclist on the room's cycle.
- `src/collab/identity.ts`: user, room id, invite URL, and `?as=<name>` test identities.
- `src/collab/collab-ui.tsx`, `collab-gate.tsx`: room popover, presence chips, join screen.
- `src/components/nodes/**/*.node.ts`: nodes, auto-discovered (see README "Adding nodes").
- `src/lib/strudel.ts`: `generateOutput()` compiles the graph to Strudel code.
- `src/hooks/use-workflow-runner.tsx`: evaluates the code, plus room alignment.
- `server/index.ts`: Hocuspocus, `node:sqlite` persistence, stateless ping→pong clock. Runs with plain `node` (types are stripped).
- `render.yaml` (static site + Docker room server), `server/Dockerfile`.

## Rules not to break
- The binding never writes or deletes another player's nodes. Undo and patch import touch only your own part.
- Audio compiles the **whole** graph. Only views, the code panel and exports filter by owner. Hiding is UI-level by design.
- `align.ts` sets Cyclist internals (`lastEnd`, `num_ticks_since_cps_change`, `clock.getPhase()`). These were checked against @strudel/core 1.2.2, so re-verify on any Strudel upgrade.
- `VITE_COLLAB_URL` and `VITE_SOURCE_URL` are baked in at build time. The About panel's AGPL "Source code" link must stay.
- Add or remove dependencies with `pnpm add`/`pnpm remove`, never by editing `package.json` by hand, so the lockfile stays valid for Render's `--frozen-lockfile`.

## Workflow
- Pushing `main` deploys the live site. Work on a branch and merge via PR.
- Keep `pnpm test` passing. `src/collab/binding.test.ts` covers sync, ownership, transport and undo merging.
- To test two players in one browser, open two tabs: `?room=test&as=Alice` and `?room=test&as=Bob`.

## Parallel sessions / worktrees
Each worktree needs its own port pair, so two sessions don't fight over 5173/1234:
- room server: `PORT=1235 node server/index.ts`
- app: `COLLAB_PORT=1235 npx vite --port 5174 --strictPort`

`data/` sits inside each worktree, so rooms stay separate. `.claude/launch.json` uses fixed ports: copy an entry with new ports instead of reusing it.

## Gotchas
- **Line endings:** `core.autocrlf=true` gives CRLF checkouts, so exact-match edits on upstream files may need CRLF→LF handling.
- **Python** is not on PATH; use node for scripts.
- **Debugging in the browser:** after a hot reload the app imports modules as `…/session.ts?t=123`. A bare `import('/src/collab/session.ts')` gives you a separate copy of the module. Take the URL from `performance.getEntriesByType('resource')` instead.
- **Background tabs:** clicks may not register in background browser tabs. Bring the tab to the front first.
- **`public/`:** Vite only serves files added there after a dev-server restart.
- **Old server install:** in the original checkout, `install --dir server` may offer to wipe and reinstall `server/node_modules`, because that install was made with a different pnpm store. Answering yes is safe. Fresh worktrees and Render's Docker build install cleanly.
- **Free Render room server:**
  - It sleeps after 15 idle minutes, and the first join afterwards takes about a minute; the client retries at least every 5 s.
  - It has no disk. A room survives a restart only while someone has it open.
