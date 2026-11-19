// Shown when the URL has ?room=. Asks for a name, then connects. The "Join"
// click also unlocks the browser's audio, so playback can start when the
// partner presses play.
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { loadUser, roomFromUrl, USER_COLORS, type User } from './identity';
import { collabServerUrl, joinRoom } from './session';

export function CollabGate({ children }: { children: ReactNode }) {
  const [room] = useState(roomFromUrl);
  const [joined, setJoined] = useState(false);
  if (!room || joined) return <>{children}</>;
  return <JoinScreen room={room} onJoined={() => setJoined(true)} />;
}

function JoinScreen({ room, onJoined }: { room: string; onJoined: () => void }) {
  const [user, setUser] = useState<User>(loadUser);
  const [state, setState] = useState<'idle' | 'joining' | 'slow'>('idle');
  const name = user.name.trim();

  useEffect(() => {
    if (state !== 'joining') return;
    const timer = setTimeout(() => setState('slow'), 4000);
    return () => clearTimeout(timer);
  }, [state]);

  const join = async () => {
    if (!name || state !== 'idle') return;
    setState('joining');
    await joinRoom(room, { ...user, name });
    onJoined();
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-background p-4 text-foreground">
      <form
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          void join();
        }}
      >
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Strudel Together
        </p>
        <h1 className="mt-1 text-lg font-semibold">Join the jam</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You'll hear everyone in the room, but you'll only see your own part.
        </p>

        <label className="mt-5 block text-xs font-medium" htmlFor="player-name">
          Your name
        </label>
        <input
          id="player-name"
          autoFocus
          maxLength={24}
          value={user.name}
          onChange={(event) => setUser({ ...user, name: event.target.value })}
          className="mt-1.5 w-full rounded-md border bg-muted/30 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        <fieldset className="mt-4">
          <legend className="text-xs font-medium">Your color</legend>
          <div className="mt-1.5 flex gap-2">
            {USER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Color ${color}`}
                aria-pressed={user.color === color}
                onClick={() => setUser({ ...user, color })}
                className={cn(
                  'size-7 rounded-full border-2 border-transparent transition-transform',
                  user.color === color && 'scale-110 border-foreground',
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </fieldset>

        <Button
          type="submit"
          className="mt-6 w-full"
          disabled={!name || state !== 'idle'}
        >
          {state === 'idle' ? 'Join and turn on sound' : 'Connecting…'}
        </Button>
        <p className="mt-3 min-h-4 text-[11px] text-muted-foreground" role="status">
          {state === 'slow'
            ? `Still trying to reach ${collabServerUrl()}. Is the room server running?`
            : `Room ${room}`}
        </p>
      </form>
    </div>
  );
}
