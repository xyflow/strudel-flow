# Model player

Lets an AI model join a Strudel Together room and jam as an ordinary player. The model runs on your machine, connects through an MCP server in this folder, and plays by writing Strudel code. Your partner sees one more player in the room, with a name and a color, and hears the model's part in the mix. Nothing in the app marks it as a model.

## Run a jam with Claude Code

1. Install the app's dependencies (`pnpm install`, see the main README). No build step: the server builds itself when it starts.
2. Start Claude Code in this repo. It finds the `strudel-together` server in `.mcp.json` and asks you once to approve it.
3. Get a room link, either from your partner or by starting a room yourself, and run:

   ```
   /jam https://…/?room=abc123 as Sam — slow and sparse, a bass line under whatever they play
   ```

4. Claude joins as "Sam", reads the rules, and keeps playing until you stop it (Esc). The transcript is your log: one line per move.

Claude Code asks before each new kind of tool call. To let the jam run on its own, choose "don't ask again" for the `strudel-together` tools when it first asks, or add `mcp__strudel-together` to `permissions.allow` in your own `.claude/settings.local.json`.

**Listening in.** `join` returns a listen link (`…?room=abc123&as=Sam&listen`). It opens the room under the model's identity, so your partner still sees a single player. Click Join without changing the name or color. You see the model's nodes as it builds them, and you hear the whole mix. That tab is a normal player view, so anything you change there changes the model's part.

**Other MCP clients.** The server is a standard stdio MCP server: command `node`, argument `agent/start.mjs`, working directory this repo. Its `jam` prompt holds the same instructions as `/jam`.

**Which room server.** Links on `localhost` use the dev server's `/collab` proxy. Other links are taken to be the live site, whose room server is `wss://strudel-together-rooms.onrender.com`. For any other deployment, set `STRUDEL_TOGETHER_ROOM_SERVER` to its room server's address. A free Render room server takes about a minute to wake after it has been idle, and `join` waits up to two minutes.

## How it works

- **A player like any other.** `agent/room.ts` joins over the same Yjs/Hocuspocus connection a browser uses, and writes through the app's own store-to-doc binding (`src/collab/binding.ts`). The binding never writes another player's nodes. The model gets no tools for play/stop, tempo or the room's view.
- **In time by construction.** The model makes no sound. Its part becomes ordinary nodes in the room, and every browser compiles and plays the whole graph on its own synchronized scheduler. So the model's part lines up with yours exactly as a person's part would.
- **Code, but only what the nodes can do.** The model writes Strudel like `$: n("[0] [2] [4]").scale("C3:major").sound("bass").lpf(800).lpq(2)`. `src/model-player/` reads each line back into visual nodes (Pad, Voice, Filter), checking every value against what the node's controls allow, then compiles those nodes with the app's compiler. What plays is exactly what the nodes produce, and the model is told about anything that came out differently. Anything else is rejected, with the reason.
- **Edits, not rebuilds.** Lines the model didn't change keep their nodes untouched. A changed line edits its nodes in place, as a person turning a knob would.
- **Pacing.** The model picks when to act. `wait` returns early when the partner changes something, so it can respond.

## The rules

The model reads [docs/model-player-rules.md](../docs/model-player-rules.md) through the `rules` tool. The document is generated from the node definitions, so it always matches the nodes:

- Each instrument and sound picker has a `*.code.ts` file next to its node (for example `src/components/nodes/instruments/pad/pad.code.ts`). It reads the node's code back into node data, using the same limits the node's UI uses (`STEPS`, `MAX_STEPS`, modifier lists, sound lists).
- Knob and select effects need no file: their calls are their parameters' labels.
- `src/model-player/rules.test.ts` fails when a node has no spec, or when the checked-in document is out of date. Regenerate it with `pnpm test -u`.
- `src/model-player/apply.test.ts` builds 400 random lines the way a person would and checks that the model can write each one back exactly.

## Tools

| Tool | What it does |
|---|---|
| `join(invite, name)` | Join a room as a player. Returns the room's state and the listen link. |
| `rules()` | The rules document. |
| `look()` | Who's here, whether it's playing, the tempo, everyone's code. |
| `wait(seconds)` | Wait 1 to 60 s. Returns early when another player's code changes, someone joins or leaves, or play/stop changes. |
| `set_code(code)` | Replace the model's whole part. |
| `edit_code(find, replace)` | Change one piece of it. |
| `leave()` | Leave the room. The model's part keeps playing, as a person's does when they close their tab. |

## Not in this version

- Pacing strategies beyond letting the model choose its waits.
- Operator controls beyond the listen link and the transcript.
- The Code node: models write only what the visual nodes can produce.
