// A small parser for the Strudel that the visual nodes produce: function calls,
// method chains, strings and numbers, one `$:` statement per part. Anything
// else is an error the model can read and fix.

export class CodeError extends Error {}

export const fail = (message: string): never => {
  throw new CodeError(message);
};

export type Arg =
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: number }
  | { kind: 'expr'; expr: Expr };
export type Call = { name: string; args: Arg[] };
/** `head(...).chain[0](...).chain[1](...)` */
export type Expr = { head: Call; chain: Call[] };

type Token =
  | { type: 'ident'; value: string; at: number }
  | { type: 'string'; value: string; at: number }
  | { type: 'number'; value: number; at: number }
  | { type: 'punct'; value: string; at: number };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (/[A-Za-z_$]/.test(ch)) {
      const match = /^[A-Za-z_$][\w$]*/.exec(source.slice(i))!;
      tokens.push({ type: 'ident', value: match[0], at: i });
      i += match[0].length;
    } else if (/[\d.-]/.test(ch) && /^-?(\d+\.?\d*|\.\d+)/.test(source.slice(i))) {
      const match = /^-?(\d+\.?\d*|\.\d+)/.exec(source.slice(i))!;
      tokens.push({ type: 'number', value: Number(match[0]), at: i });
      i += match[0].length;
    } else if (ch === '"' || ch === "'") {
      let value = '';
      let j = i + 1;
      while (j < source.length && source[j] !== ch) {
        if (source[j] === '\\' && j + 1 < source.length) j++;
        if (source[j] === '\n') fail('A string is missing its closing quote.');
        value += source[j++];
      }
      if (j >= source.length) fail('A string is missing its closing quote.');
      tokens.push({ type: 'string', value, at: i });
      i = j + 1;
    } else if ('(),.'.includes(ch)) {
      tokens.push({ type: 'punct', value: ch, at: i });
      i++;
    } else if (ch === '`') {
      fail('Use "double quotes" for strings, not backticks.');
    } else {
      fail(`Unexpected \`${source.slice(i, i + 12).split('\n')[0]}\`.`);
    }
  }
  return tokens;
}

export function parseExpr(source: string): Expr {
  const tokens = tokenize(source);
  let pos = 0;
  const peek = () => tokens[pos];
  const describe = (token: Token | undefined) =>
    token ? `\`${token.value}\`` : 'the end';
  const expect = (value: string) => {
    const token = tokens[pos];
    if (token?.type !== 'punct' || token.value !== value)
      fail(`Expected \`${value}\` but found ${describe(token)}.`);
    pos++;
  };

  function call(): Call {
    const token = tokens[pos];
    if (token?.type !== 'ident')
      fail(`Expected a function name but found ${describe(token)}.`);
    pos++;
    const name = (token as { value: string }).value;
    const next = peek();
    if (next?.type !== 'punct' || next.value !== '(')
      fail(`\`${name}\` must be called, like \`${name}(...)\`.`);
    expect('(');
    const args: Arg[] = [];
    while (!(peek()?.type === 'punct' && peek()!.value === ')')) {
      args.push(arg());
      const after = peek();
      if (after?.type === 'punct' && after.value === ',') pos++;
      else break;
    }
    expect(')');
    return { name, args };
  }

  function arg(): Arg {
    const token = peek();
    if (token?.type === 'string') {
      pos++;
      return { kind: 'string', value: token.value };
    }
    if (token?.type === 'number') {
      pos++;
      return { kind: 'number', value: token.value };
    }
    return { kind: 'expr', expr: expr() };
  }

  function expr(): Expr {
    let head: Call;
    let chain: Call[] = [];
    const token = peek();
    if (token?.type === 'punct' && token.value === '(') {
      pos++;
      const inner = expr();
      expect(')');
      head = inner.head;
      chain = inner.chain;
    } else {
      head = call();
    }
    while (peek()?.type === 'punct' && peek()!.value === '.') {
      pos++;
      chain.push(call());
    }
    return { head, chain };
  }

  if (tokens.length === 0) fail('The line is empty.');
  const result = expr();
  if (pos < tokens.length)
    fail(`Unexpected ${describe(tokens[pos])} after the pattern.`);
  return result;
}

export function formatArg(arg: Arg): string {
  if (arg.kind === 'string') return JSON.stringify(arg.value);
  if (arg.kind === 'number') return String(arg.value);
  return formatExpr(arg.expr);
}
export function formatCall(call: Call): string {
  return `${call.name}(${call.args.map(formatArg).join(', ')})`;
}
export function formatExpr(expr: Expr): string {
  return [expr.head, ...expr.chain].map(formatCall).join('.');
}

export type Statement =
  | { kind: 'tempo'; text: string; line: number }
  | { kind: 'part'; text: string; code: string; paused: boolean; line: number };

/**
 * Split a part into statements. A part is `$: ...` lines (a statement runs
 * until the next one starts), `// $: ...` paused lines (each of their lines
 * commented out), and optionally the tempo line. Other comments are ignored.
 */
export function splitStatements(source: string): Statement[] {
  const statements: Statement[] = [];
  let current: Extract<Statement, { kind: 'part' }> | null = null;
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  lines.forEach((raw, index) => {
    const line = index + 1;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const comment = /^\/\/ ?(.*)$/.exec(trimmed);
    const body = comment ? comment[1] : trimmed;
    if (/^\$:/.test(body.trim())) {
      current = {
        kind: 'part',
        text: trimmed,
        code: body.trim().replace(/^\$:\s*/, ''),
        paused: Boolean(comment),
        line,
      };
      statements.push(current);
      return;
    }
    if (!comment && /^setcpm\s*\(/.test(trimmed)) {
      statements.push({ kind: 'tempo', text: trimmed, line });
      current = null;
      return;
    }
    // A paused statement continues only while it's visibly unfinished, so a
    // comment after it stays a comment.
    const continues = (code: string) =>
      /^[.)]/.test(body.trim()) ||
      (code.match(/\(/g)?.length ?? 0) > (code.match(/\)/g)?.length ?? 0);
    if (
      current &&
      Boolean(comment) === current.paused &&
      (!current.paused || continues(current.code))
    ) {
      current.text += `\n${trimmed}`;
      current.code += `\n${body}`;
      return;
    }
    if (comment) return; // a note to self
    fail(
      `Line ${line}: \`${trimmed.slice(0, 40)}\` isn't part of a \`$:\` line. Every part starts with \`$:\`.`,
    );
  });
  return statements;
}
