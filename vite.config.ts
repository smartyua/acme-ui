import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ACME_BASE=/acme-ui-assets/ when building for the kylypko.com embed
const base = process.env.ACME_BASE || '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: { port: 5180, open: true },
});
