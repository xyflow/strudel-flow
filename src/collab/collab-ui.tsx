import { useState } from 'react';
import { Panel } from '@xyflow/react';
import { Copy, Users } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ControlButton } from '@/components/editor/control-button';
import { useAppStore } from '@/store/app-store';
import { inviteUrl, newRoomId, type User } from './identity';
import { getSession, useCollabStore } from './session';

function Avatar({ user, you = false }: { user: User; you?: boolean }) {
  return (
    <span
      title={you ? `${user.name} (you)` : user.name}
      className="inline-flex size-7 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 ring-card"
      style={{ backgroundColor: user.color }}
    >
      {user.name.slice(0, 1).toUpperCase() || '?'}
    </span>
  );
}

/** Who's in the room, next to the logo. */
export function PresenceChips() {
  const room = useCollabStore((state) => state.room);
  const me = useCollabStore((state) => state.me);
  const peers = useCollabStore((state) => state.peers);
  const status = useCollabStore((state) => state.status);
  if (!room || !me) return null;
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card py-1 pr-3 pl-1">
      <div className="flex -space-x-1.5">
        <Avatar user={me} you />
        {peers.map((peer) => (
          <Avatar key={peer.id} user={peer} />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground">
        {status !== 'connected'
          ? 'Reconnecting…'
          : peers.length === 0
            ? 'Waiting for your partner'
            : `Jamming with ${peers.map((peer) => peer.name).join(', ')}`}
      </span>
    </div>
  );
}

function isLocalAddress() {
  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
}

function syncLabel(errorMs: number | null, synced: boolean) {
  if (!synced) return 'Measuring clock…';
  if (errorMs === null) return 'In sync when playing';
  const size = Math.abs(errorMs);
  return size < 20
    ? `On the beat (${size.toFixed(0)} ms)`
    : `Catching up (${size.toFixed(0)} ms off)`;
}

/** Toolbar button: start a room, or manage the current one. */
export function CollabPopover() {
  const room = useCollabStore((state) => state.room);
  const me = useCollabStore((state) => state.me);
  const peers = useCollabStore((state) => state.peers);
  const view = useCollabStore((state) => state.view);
  const clock = useCollabStore((state) => state.clock);
  const alignErrorMs = useCollabStore((state) => state.alignErrorMs);
  const [copied, setCopied] = useState(false);

  const link = room ? inviteUrl(room) : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // The link stays selectable in the field.
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ControlButton title={room ? 'Jam room' : 'Jam with someone'} active={!!room}>
          <Users className="size-4" />
        </ControlButton>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-[min(340px,calc(100vw-24px))] rounded-lg p-4 text-xs"
      >
        {!room || !me ? (
          <>
            <h3 className="text-sm font-semibold">Jam with someone</h3>
            <p className="mt-2 text-muted-foreground">
              Start a room and send the link to a friend. You'll both hear the
              whole piece, but each of you only sees your own part.
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => {
                window.location.href = inviteUrl(newRoomId());
              }}
            >
              Start a room
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold">Jam room</h3>
            <label className="mt-3 block font-medium" htmlFor="invite-link">
              Invite link
            </label>
            <div className="mt-1.5 flex gap-1">
              <input
                id="invite-link"
                readOnly
                value={link}
                onFocus={(event) => event.target.select()}
                className="min-w-0 flex-1 rounded-md border bg-background/50 px-2 py-1.5 font-mono text-[10px] text-muted-foreground"
              />
              <Button variant="secondary" size="sm" onClick={copy}>
                <Copy className="size-3.5" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            {isLocalAddress() && (
              <p className="mt-1.5 text-muted-foreground">
                This link only works on this computer. To invite someone on
                your network, run <code>pnpm dev:lan</code> and open the app
                at its network address.
              </p>
            )}

            <div className="mt-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <Avatar user={me} you />
                <span>{me.name} (you)</span>
              </div>
              {peers.map((peer) => (
                <div key={peer.id} className="flex items-center gap-2">
                  <Avatar user={peer} />
                  <span>{peer.name}</span>
                </div>
              ))}
              {peers.length === 0 && (
                <p className="text-muted-foreground">Nobody else is here yet.</p>
              )}
            </div>

            <label className="mt-4 flex items-center justify-between gap-3 border-t pt-3">
              <span>
                <span className="block font-medium">Hide each other's work</span>
                <span className="text-muted-foreground">
                  Applies to everyone in the room.
                </span>
              </span>
              <Switch
                checked={view === 'private'}
                onCheckedChange={(checked) =>
                  getSession()?.binding.setView(checked ? 'private' : 'shared')
                }
              />
            </label>

            <p className="mt-3 border-t pt-3 text-muted-foreground" title={`Clock offset ${clock.offsetMs.toFixed(0)} ms, round trip ${clock.rttMs.toFixed(0)} ms`}>
              {syncLabel(alignErrorMs, clock.synced)}
              {clock.synced && ` · ${clock.rttMs.toFixed(0)} ms round trip`}
            </p>
            <button
              className="mt-3 text-muted-foreground underline underline-offset-2 hover:text-foreground"
              onClick={() => {
                const url = new URL(window.location.href);
                url.search = '';
                window.location.href = url.toString();
              }}
            >
              Leave room
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Shown when your own canvas is empty but you're in a room. */
export function EmptyPartHint() {
  const room = useCollabStore((state) => state.room);
  const view = useCollabStore((state) => state.view);
  const peers = useCollabStore((state) => state.peers);
  const isPlaying = useAppStore((state) => state.isPlaying);
  if (!room) return null;
  const partner = peers.map((peer) => peer.name).join(' and ') || 'Your partner';
  return (
    <Panel
      position="bottom-center"
      className="mb-10! max-w-[min(420px,90vw)] rounded-md border border-border/70 bg-card/95 p-4 text-center text-xs text-muted-foreground"
    >
      <p className="text-sm font-medium text-foreground">Your canvas is empty</p>
      <p className="mt-1">
        {view === 'private'
          ? `${partner}'s part is hidden from you${isPlaying ? ', but you can hear it' : ''}.`
          : 'Add a node to start your part.'}{' '}
        Right-click the canvas or press + to add your first node.
      </p>
    </Panel>
  );
}
