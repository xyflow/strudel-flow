import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import process from 'node:process';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base:
    process.env.VERCEL_ENV === 'production'
      ? 'https://flow-machine-xyflow.vercel.app/'
      : '/',
});
