import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Unit tests sit next to the source (src/**/*.test.ts[x]); repo contract tests live in tests/.
// Browser tests are Playwright's (e2e/), not Vitest's.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    css: false,
    // Coverage means "everything we ship", not "everything a test happened to import": untested
    // files have to show up as 0% or the number means nothing. main.tsx is wiring Playwright drives.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/vite-env.d.ts'],
      reporter: ['text', 'html', 'lcov'],
      // Ratchet: raise these whenever coverage goes up, never lower them (same rule as the debt files).
      thresholds: {
        // A ratchet: these track the real numbers and only ever move up.
        statements: 70,
        branches: 63,
        functions: 57,
        lines: 72,
      },
    },
  },
});
