import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        './src'
      ),
    },
  },
  base: 'https://flow-machine-xyflow.vercel.app/',
});
