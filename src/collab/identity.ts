import { customAlphabet, nanoid } from 'nanoid';

export type User = { id: string; name: string; color: string };

export const USER_COLORS = [
  '#e4572e',
  '#f3a712',
  '#29bf12',
  '#17bebb',
  '#4c6ef5',
  '#a23b72',
] as const;

const STORAGE_KEY = 'strudel-together:user';

function readStoredUser(): Partial<User> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveUser(user: User) {
  // `?as=` test identities aren't remembered.
  if (user.id.startsWith('as-')) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Private mode or blocked storage: the identity lasts for this tab only.
  }
}

/**
 * The local player. `?as=<name>` gives a throwaway identity derived from the
 * name, so two tabs of the same browser can act as two different players.
 */
export function loadUser(href = window.location.href): User {
  const as = new URL(href).searchParams.get('as')?.trim();
  if (as) {
    const color =
      USER_COLORS[
        [...as].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
          USER_COLORS.length
      ];
    return { id: `as-${as.toLowerCase()}`, name: as, color };
  }
  const stored = readStoredUser();
  return {
    id: typeof stored.id === 'string' ? stored.id : nanoid(),
    name: typeof stored.name === 'string' ? stored.name : '',
    color:
      typeof stored.color === 'string'
        ? stored.color
        : USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
  };
}

export function roomFromUrl(href = window.location.href): string | null {
  const room = new URL(href).searchParams.get('room');
  return room && /^[A-Za-z0-9_-]{1,64}$/.test(room) ? room : null;
}

/** Unguessable, URL-safe room id. */
export const newRoomId = customAlphabet(
  '23456789abcdefghijkmnpqrstuvwxyz',
  12,
);

export function inviteUrl(room: string, href = window.location.href) {
  const url = new URL(href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('room', room);
  return url.toString();
}
