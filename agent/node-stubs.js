// Vite plugin: load the app's node definitions and compiler outside the
// browser (the model connector, and unit tests).
//
// Node definitions (`*.node.ts`) import their React controls, and those pull
// in browser-only code (the app store, Strudel's audio engine). The connector
// only needs each definition's parameters and code generator, so the React
// modules a definition imports are replaced with empty stand-ins, and so is
// `@strudel/web`. Code generation itself is untouched, so the connector
// produces exactly the code the browsers play.
import { readFileSync } from 'node:fs';

const UI_STUB = '\0node-stubs:ui:';
const STRUDEL_STUB = '\0node-stubs:strudel-web';
const IMPORTS_UI = /(\.node\.tsx?|[\\/]registry\.tsx)$/;

export function nodeStubs() {
  return {
    name: 'strudel-together:node-stubs',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (source === '@strudel/web') return STRUDEL_STUB;
      if (!importer || !IMPORTS_UI.test(importer.split('?')[0])) return null;
      const resolved = await this.resolve(source, importer, {
        ...options,
        skipSelf: true,
      });
      if (!resolved || !resolved.id.split('?')[0].endsWith('.tsx')) return null;
      return UI_STUB + resolved.id.split('?')[0];
    },
    load(id) {
      if (id === STRUDEL_STUB) {
        // custom.ts uses the transpiler for the Code node's syntax check.
        // Models can't use the Code node, so it is never needed here.
        return 'export function transpiler() { throw new Error("The Strudel transpiler is not available outside the browser."); }';
      }
      if (!id.startsWith(UI_STUB)) return null;
      const source = readFileSync(id.slice(UI_STUB.length), 'utf8');
      const names = [
        ...source.matchAll(
          /export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g,
        ),
      ].map((match) => match[1]);
      return (
        names.map((name) => `export const ${name} = () => null;`).join('\n') ||
        'export {};'
      );
    },
  };
}
