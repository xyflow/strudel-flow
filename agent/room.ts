// A model player's connection to a jam room, from Node.
//
// It joins over the same Yjs/Hocuspocus connection a browser uses, as an
// ordinary player: a name, a color, presence. Its part is ordinary nodes in the
// room, written through the same store-to-doc binding the app uses, so it can
// only ever change its own nodes. It makes no sound itself: every browser in
// the room compiles and plays the whole graph, the model's part included.
import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from '@hocuspocus/provider';
import * as Y from 'yjs';
import { createStore } from 'zustand/vanilla';
import { bindStoreToDoc, type BoundState } from '@/collab/binding';
import { loadUser, roomFromUrl, type User } from '@/collab/identity';
import { tempoLine } from '@/lib/strudel';
import {
  applyPart,
  editPart,
  othersCode,
  ownLines,
  partCode,
} from '@/model-player/apply';
import { fail } from '@/model-player/syntax';

/** The live site's room server (README.md, "Deploying"). */
export const LIVE_ROOM_SERVER = 'wss://strudel-together-rooms.onrender.com';

/**
 * Which room server an invite link's room lives on. A local dev server
 * proxies it at /collab. Anything else is assumed to be the live site, unless
 * STRUDEL_TOGETHER_ROOM_SERVER says otherwise.
 */
export function roomServerFor(invite: URL): string {
  const configured = process.env.STRUDEL_TOGETHER_ROOM_SERVER?.trim();
  if (configured) return configured.replace(/^http/i, 'ws');
  const host = invite.hostname;
  if (['localhost', '127.0.0.1', '[::1]'].includes(host) || host.endsWith('.localhost'))
    return `${invite.protocol === 'https:' ? 'wss' : 'ws'}://${invite.host}/collab`;
  return LIVE_ROOM_SERVER;
}

type Status = 'connecting' | 'connected' | 'disconnected';
export type Room = Awaited<ReturnType<typeof joinRoom>>;

export async function joinRoom(
  link: string,
  name: string,
  { timeoutMs = 120_000 }: { timeoutMs?: number } = {},
) {
  let invite: URL;
  try {
    invite = new URL(link.trim());
  } catch {
    return fail(`"${link}" isn't a link. Use the room's invite link, like https://…/?room=abc123.`);
  }
  const room = roomFromUrl(invite.href);
  if (!room) fail('That link has no ?room=. Use the room\'s invite link.');
  const playerName = name.trim();
  if (!playerName || playerName.length > 24)
    fail('The player name must be 1 to 24 characters.');
  // The same identity a browser gets from ?as=<name>, so the operator can
  // listen in under it (see listenLink).
  const me: User = loadUser(
    `${invite.origin}/?as=${encodeURIComponent(playerName)}`,
  );
  const server = roomServerFor(invite);

  const store = createStore<BoundState>()((set) => ({
    nodes: [],
    edges: [],
    cpm: '120',
    bpc: '4',
    name: 'Untitled patch',
    isPlaying: false,
    error: null,
    graphRevision: 0,
    toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  }));

  const doc = new Y.Doc();
  let status: Status = 'connecting';
  let peers: User[] = [];
  const listeners = new Set<() => void>();
  const changed = () => listeners.forEach((listener) => listener());

  const socket = new HocuspocusProviderWebsocket({ url: server, maxDelay: 5000 });
  let resolveSynced!: () => void;
  const synced = new Promise<void>((resolve) => (resolveSynced = resolve));
  const provider = new HocuspocusProvider({
    websocketProvider: socket,
    name: room!,
    document: doc,
    onStatus: ({ status: next }) => {
      status = next as Status;
      changed();
    },
    onSynced: ({ state }) => {
      if (state) resolveSynced();
    },
    onAwarenessChange: ({ states }) => {
      const byId = new Map<string, User>();
      for (const state of states as { user?: User }[]) {
        if (state.user?.id && state.user.id !== me.id)
          byId.set(state.user.id, state.user);
      }
      peers = [...byId.values()];
      changed();
    },
  });
  provider.attach();
  provider.awareness?.setLocalStateField('user', me);

  const leave = () => {
    provider.destroy();
    socket.destroy();
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), timeoutMs);
  });
  const outcome = await Promise.race([synced, timedOut]);
  clearTimeout(timer);
  if (outcome === 'timeout') {
    leave();
    fail(
      `Couldn't reach the room server at ${server} within ${timeoutMs / 1000} s. A free Render server can take a minute to wake up; try again. For another server, set STRUDEL_TOGETHER_ROOM_SERVER.`,
    );
  }

  const binding = bindStoreToDoc({ store, doc, me: me.id, now: () => Date.now() });
  store.subscribe(changed);

  const tempo = () => tempoLine(store.getState().cpm, store.getState().bpc);
  const mine = () => partCode(ownLines(store.getState(), me.id));
  const others = () => {
    const names = new Map(peers.map((peer) => [peer.id, peer.name]));
    return [...othersCode(store.getState(), me.id)].map(([owner, code]) => ({
      name: names.get(owner) ?? 'A player who left',
      code,
    }));
  };
  /** What a `wait` watches: other players' code, presence and play/stop. */
  const signature = () =>
    JSON.stringify([
      others(),
      peers.map((peer) => peer.id).sort(),
      store.getState().isPlaying,
    ]);

  function setCode(code: string) {
    const state = store.getState();
    const result = applyPart(state, me.id, code, tempo());
    if (result.changed)
      store.setState({ nodes: result.graph.nodes, edges: result.graph.edges });
    return result;
  }

  return {
    room: room!,
    me,
    server,
    /** Opens the room under the model's identity, without adding a player. */
    listenLink: `${invite.origin}${invite.pathname}?room=${room}&as=${encodeURIComponent(playerName)}&listen`,
    status: () => status,
    peers: () => peers,
    playing: () => store.getState().isPlaying,
    tempo,
    mine,
    others,
    setCode,
    editCode: (find: string, replace: string) =>
      setCode(editPart(mine(), find, replace)),
    /**
     * Wait up to `seconds`. Returns early when another player's code settles
     * after a change (1.5 s without further edits, so a knob being turned
     * counts once), someone joins or leaves, or playback starts or stops.
     */
    wait(seconds: number): Promise<'changed' | 'time'> {
      const start = signature();
      return new Promise((resolve) => {
        let settle: ReturnType<typeof setTimeout> | undefined;
        const finish = (reason: 'changed' | 'time') => {
          clearTimeout(settle);
          clearTimeout(limit);
          listeners.delete(onChange);
          resolve(reason);
        };
        const onChange = () => {
          clearTimeout(settle);
          if (signature() !== start) settle = setTimeout(() => finish('changed'), 1500);
        };
        const limit = setTimeout(() => finish('time'), seconds * 1000);
        listeners.add(onChange);
      });
    },
    leave() {
      binding.unbind();
      leave();
    },
  };
}
