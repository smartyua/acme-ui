import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Unit tests sit next to the source (src/**/*.test.ts[x]); repo contract tests live in tests/.
// Browser tests are Playwright's (e2e/), not Vitest's.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
    css: false,
  },
});
