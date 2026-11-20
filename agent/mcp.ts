// Strudel Together model player: an MCP server that lets a model join a jam
// room and play as an ordinary player. See agent/README.md.
//
// Run through agent/start.mjs, which builds this file first.
import { readFileSync } from 'node:fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { rulesDocument } from '@/model-player/rules';
import { CodeError } from '@/model-player/syntax';
import { joinRoom, type Room } from './room';

// stdout carries the MCP protocol; anything logged goes to stderr.
console.log = console.error;

let room: Room | null = null;

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] });
const problem = (value: string) => ({ ...text(value), isError: true });

function inRoom(): Room {
  if (!room) throw new CodeError('You are not in a room yet. Call join first.');
  return room;
}

/** Run a tool; errors meant for the model come back as tool errors. */
async function run(action: () => string | Promise<string>) {
  try {
    return text(await action());
  } catch (error) {
    if (error instanceof CodeError) return problem(error.message);
    throw error;
  }
}

function describeRoom(current: Room, { yours = true } = {}) {
  const players = current.peers().map((peer) => peer.name);
  const lines = [
    `Room ${current.room}: ${current.status()}, ${
      current.playing()
        ? 'playing'
        : 'stopped (nothing sounds until someone in the room presses play)'
    }.`,
    `Tempo: ${current.tempo()}. One cycle is one bar.`,
    `Players with you: ${players.length ? players.join(', ') : 'nobody yet'}.`,
  ];
  for (const other of current.others())
    lines.push('', `${other.name}'s code:`, other.code);
  if (current.others().length === 0) lines.push('', 'Nobody else has a part yet.');
  if (yours) lines.push('', 'Your code:', current.mine() || '(empty)');
  return lines.join('\n');
}

const server = new McpServer(
  { name: 'strudel-together', version: '0.1.0' },
  {
    instructions:
      'Play in a Strudel Together jam room as an ordinary player. Call join with the room link and a player name, read the rules, then loop: look, change your part with set_code or edit_code, wait. You can only write code the visual nodes can produce, and only your own part.',
  },
);

server.registerTool(
  'join',
  {
    description:
      'Join a jam room as a player. Your partner sees you like any other player, under the name you give.',
    inputSchema: {
      invite: z.string().describe('The room invite link, like https://…/?room=abc123'),
      name: z.string().describe('Your player name, 1 to 24 characters'),
    },
  },
  ({ invite, name }) =>
    run(async () => {
      if (room) throw new CodeError(`You are already in room ${room.room}. Call leave first.`);
      room = await joinRoom(invite, name);
      return [
        `Joined room ${room.room} as ${room.me.name}.`,
        `Listen link for the person running you: ${room.listenLink}`,
        'It opens the room as you, so your partner still sees one player. Click Join without changing the name or color.',
        'Read the rules (the rules tool) before your first change.',
        '',
        describeRoom(room),
      ].join('\n');
    }),
);

server.registerTool(
  'rules',
  { description: 'The rules: exactly which Strudel code you can write.' },
  () => run(() => rulesDocument()),
);

server.registerTool(
  'look',
  { description: "The room now: who's here, whether it's playing, everyone's code." },
  () => run(() => describeRoom(inRoom())),
);

server.registerTool(
  'wait',
  {
    description:
      'Wait before your next move, like a person listening. Returns early when another player changes their part, someone joins or leaves, or playback starts or stops.',
    inputSchema: { seconds: z.number().min(1).max(60).describe('1 to 60') },
  },
  ({ seconds }) =>
    run(async () => {
      const current = inRoom();
      const started = Date.now();
      const reason = await current.wait(seconds);
      const waited = Math.round((Date.now() - started) / 1000);
      if (reason === 'time') return `Waited ${waited} s. Nothing changed.`;
      return `After ${waited} s, something changed.\n\n${describeRoom(current, { yours: false })}`;
    }),
);

function reportChange(result: ReturnType<Room['setCode']>) {
  const lines = [
    result.changed ? 'Your part now plays:' : 'No change. Your part plays:',
    result.code || '(empty)',
  ];
  if (result.notes.length) lines.push('', 'Notes:', ...result.notes.map((n) => `- ${n}`));
  return lines.join('\n');
}

server.registerTool(
  'set_code',
  {
    description:
      'Replace your whole part with this code. Lines you leave unchanged keep their nodes. If any line breaks the rules, nothing changes and you get the reasons.',
    inputSchema: { code: z.string().describe('Your whole part: `$:` lines') },
  },
  ({ code }) => run(() => reportChange(inRoom().setCode(code))),
);

server.registerTool(
  'edit_code',
  {
    description:
      'Change one piece of your part: replaces the one place `find` appears in your current code. Same rules as set_code.',
    inputSchema: {
      find: z.string().describe('Text that appears exactly once in your current code'),
      replace: z.string().describe('What to put there instead'),
    },
  },
  ({ find, replace }) => run(() => reportChange(inRoom().editCode(find, replace))),
);

server.registerTool(
  'leave',
  {
    description: 'Leave the room. Your part keeps playing for the others, as when a person closes their tab.',
  },
  () =>
    run(() => {
      const current = inRoom();
      current.leave();
      room = null;
      return `Left room ${current.room}.`;
    }),
);

// The same instructions as the /jam command in Claude Code, for any MCP client.
server.registerPrompt(
  'jam',
  {
    description: 'Join a room and jam as a player',
    argsSchema: {
      brief: z
        .string()
        .describe('<room link> as <name>, then how to play, e.g. "sparse, dubby bass"'),
    },
  },
  ({ brief }) => {
    const command = readFileSync(
      new URL('../../.claude/commands/jam.md', import.meta.url),
      'utf8',
    );
    const body = command.replace(/^---[\s\S]*?---\s*/, '').replace('$ARGUMENTS', brief);
    return { messages: [{ role: 'user', content: { type: 'text', text: body } }] };
  },
);

process.on('SIGINT', () => {
  room?.leave();
  process.exit(0);
});
process.stdin.on('close', () => {
  room?.leave();
  process.exit(0);
});

await server.connect(new StdioServerTransport());
