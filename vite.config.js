import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { fileURLToPath } from 'url';
import process from 'node:process';

// The app reaches the room server at /collab on its own origin; this proxy
// forwards it to the local room server. One address, one certificate.
const collabProxy = {
  '/collab': {
    target: `ws://localhost:${process.env.COLLAB_PORT ?? 1234}`,
    ws: true,
    rewrite: (path) => path.replace(/^\/collab/, ''),
  },
};

export default defineConfig(({ mode }) => {
  // `vite --mode lan`: reachable from other computers on the network, over
  // HTTPS. Browsers only allow Web Audio worklets (which Strudel needs) on
  // secure pages, and http://<LAN-IP> isn't one. The certificate is
  // self-signed, so each browser shows a warning to click through once.
  const lan = mode === 'lan';
  return {
    plugins: [react(), tailwindcss(), ...(lan ? [basicSsl()] : [])],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: { host: lan ? true : undefined, proxy: collabProxy },
    preview: { proxy: collabProxy },
    base:
      process.env.VERCEL_ENV === 'production'
        ? 'https://flow-machine-xyflow.vercel.app/'
        : '/',
  };
});
