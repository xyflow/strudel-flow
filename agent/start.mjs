// Starts the model-player MCP server (agent/README.md). It builds the server
// from the app's sources first, so it always matches the nodes in this
// checkout. stdout is the MCP channel, so the build stays silent.
import { build } from 'vite';
import { fileURLToPath } from 'node:url';

await build({
  configFile: fileURLToPath(new URL('./vite.config.js', import.meta.url)),
  logLevel: 'silent',
});
await import(new URL('./dist/mcp.js', import.meta.url).href);
