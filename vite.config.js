import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import process from 'node:process';

// Without VITE_COLLAB_URL the app reaches the room server at /collab on its
// own origin; in local dev and preview this forwards it to the room server.
const collabProxy = {
  '/collab': {
    target: `ws://localhost:${process.env.COLLAB_PORT ?? 1234}`,
    ws: true,
    rewrite: (path) => path.replace(/^\/collab/, ''),
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: { proxy: collabProxy },
  preview: { proxy: collabProxy },
});
