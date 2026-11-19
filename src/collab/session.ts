// The live connection to a jam room: Y.Doc + Hocuspocus provider + binding +
// server clock. One session per page.
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { create } from 'zustand';
import { useAppStore } from '@/store/app-store';
import { initialEdges, initialNodes } from '@/data/workflow-data';
import { bindStoreToDoc, type Binding, type Transport } from './binding';
import { createServerClock, type ClockStats, type ServerClock } from './clock';
import { saveUser, type User } from './identity';
import { adoptGraph, type ViewMode } from './ownership';

export type Peer = User;

type CollabState = {
  room: string | null;
  me: User | null;
  status: 'idle' | 'connecting' | 'connected' | 'disconnected';
  peers: Peer[];
  view: ViewMode;
  clock: ClockStats;
  /** Last measured distance from the room's cycle, in ms. */
  alignErrorMs: number | null;
  transportRevision: number;
};

export const useCollabStore = create<CollabState>(() => ({
  room: null,
  me: null,
  status: 'idle',
  peers: [],
  view: 'private',
  clock: { synced: false, offsetMs: 0, rttMs: 0 },
  alignErrorMs: null,
  transportRevision: 0,
}));

export type Session = {
  room: string;
  me: User;
  doc: Y.Doc;
  provider: HocuspocusProvider;
  binding: Binding;
  clock: ServerClock;
};

let session: Session | null = null;

export function getSession() {
  return session;
}

/** The local player's id while in a room, else null (solo mode). */
export function getMe(): string | null {
  return session?.me.id ?? null;
}

export function getView(): ViewMode {
  return session?.binding.getView() ?? 'shared';
}

export function getTransport(): Transport | null {
  return session?.binding.getTransport() ?? null;
}

export function collabServerUrl() {
  const configured = import.meta.env.VITE_COLLAB_URL as string | undefined;
  if (configured) return configured;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.hostname}:1234`;
}

function peersFrom(states: { clientId: number; user?: Peer }[], me: User) {
  const byId = new Map<string, Peer>();
  for (const state of states) {
    const user = state.user;
    if (!user || typeof user.id !== 'string' || user.id === me.id) continue;
    byId.set(user.id, user);
  }
  return [...byId.values()];
}

export async function joinRoom(room: string, me: User): Promise<Session> {
  if (session) return session;
  saveUser(me);
  useCollabStore.setState({ room, me, status: 'connecting' });

  const doc = new Y.Doc();
  const clock = createServerClock({
    onStats: (stats) => useCollabStore.setState({ clock: stats }),
  });

  let resolveSynced: () => void;
  const synced = new Promise<void>((resolve) => (resolveSynced = resolve));

  const provider = new HocuspocusProvider({
    url: collabServerUrl(),
    name: room,
    document: doc,
    onStatus: ({ status }) =>
      useCollabStore.setState({
        status: status as CollabState['status'],
      }),
    onSynced: ({ state }) => {
      if (state) resolveSynced();
    },
    onStateless: ({ payload }) => clock.handle(payload),
    onAwarenessChange: ({ states }) =>
      useCollabStore.setState({ peers: peersFrom(states, me) }),
  });
  provider.awareness?.setLocalStateField('user', me);

  await synced;
  clock.start((payload) => provider.sendStateless(payload));

  const binding = bindStoreToDoc({
    store: useAppStore,
    doc,
    me: me.id,
    now: () => clock.now(),
    onViewChange: (view) => useCollabStore.setState({ view }),
    onTransportChange: () =>
      useCollabStore.setState((state) => ({
        transportRevision: state.transportRevision + 1,
      })),
  });

  // The first player into an empty room gets the starter patch. Later players
  // start with an empty canvas (and hear the others' parts).
  if (binding.nodeCount() === 0) {
    const starter = adoptGraph(initialNodes, initialEdges, me.id);
    useAppStore.setState((state) => ({
      nodes: starter.nodes,
      edges: starter.edges,
      graphRevision: state.graphRevision + 1,
    }));
  }

  session = { room, me, doc, provider, binding, clock };
  return session;
}

export function leaveRoom() {
  if (!session) return;
  session.clock.stop();
  session.binding.unbind();
  session.provider.destroy();
  session.doc.destroy();
  session = null;
  useCollabStore.setState({ status: 'idle', peers: [], room: null });
}
