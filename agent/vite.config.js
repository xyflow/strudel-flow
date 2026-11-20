// Builds the model-player MCP server (agent/mcp.ts) for Node, from the app's
// own sources. agent/start.mjs runs this build every time the server starts.
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { nodeStubs } from './node-stubs.js';

const path = (relative) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  root: path('..'),
  logLevel: 'silent',
  publicDir: false,
  plugins: [nodeStubs()],
  resolve: { alias: { '@': path('../src') } },
  build: {
    ssr: path('./mcp.ts'),
    outDir: path('./dist'),
    emptyOutDir: true,
    target: 'node22',
    sourcemap: true,
    rollupOptions: { output: { entryFileNames: 'mcp.js' } },
  },
});
