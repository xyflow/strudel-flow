// Strudel Together room server.
//
// - Yjs document sync for each room (Hocuspocus)
// - SQLite persistence using Node's built-in node:sqlite (no native addon)
// - A clock: clients send {type:'ping', t0} as a stateless message and get
//   {type:'pong', t0, ts} back, where ts is this server's Date.now(). Clients use
//   it to put both players' Strudel schedulers on the same cycle.
//
// Run: node index.ts  (Node 22.18+ strips TypeScript types natively)
import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const port = Number(process.env.PORT ?? 1234);
const dbPath = resolve(process.env.DB_PATH ?? 'data/rooms.sqlite');
mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`CREATE TABLE IF NOT EXISTS rooms (
  name TEXT PRIMARY KEY,
  state BLOB NOT NULL,
  updated_at INTEGER NOT NULL
)`);
const selectRoom = db.prepare('SELECT state FROM rooms WHERE name = ?');
const upsertRoom = db.prepare(
  `INSERT INTO rooms (name, state, updated_at) VALUES (?, ?, ?)
   ON CONFLICT(name) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`,
);

// Room names arrive from the client. Keep them short and boring.
const ROOM_NAME = /^[A-Za-z0-9_-]{1,64}$/;

const server = new Server({
  port,
  quiet: true,
  // Persist about once a second while people are editing.
  debounce: 1000,
  maxDebounce: 5000,

  async onAuthenticate({ documentName }) {
    if (!ROOM_NAME.test(documentName)) throw new Error('Invalid room name');
  },

  async onStateless({ payload, connection }) {
    let message: { type?: string; t0?: number };
    try {
      message = JSON.parse(payload);
    } catch {
      return;
    }
    if (message.type === 'ping' && typeof message.t0 === 'number') {
      connection.sendStateless(
        JSON.stringify({ type: 'pong', t0: message.t0, ts: Date.now() }),
      );
    }
  },

  // Plain HTTP requests get Hocuspocus's default 200 response, which is
  // enough for a hosting platform's health check.
  extensions: [
    new Database({
      async fetch({ documentName }) {
        const row = selectRoom.get(documentName) as
          | { state: Uint8Array }
          | undefined;
        return row ? new Uint8Array(row.state) : null;
      },
      async store({ documentName, state }) {
        upsertRoom.run(documentName, state, Date.now());
      },
    }),
  ],
});

await server.listen();
console.log(`Strudel Together server on ws://localhost:${port} (db: ${dbPath})`);
