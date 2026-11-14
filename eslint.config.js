// ESLint flat config. Run with `npm run lint`.
// Enforces the parts of AGENTS.md / DESIGN.md that can be checked statically in TS/TSX.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// DESIGN.md §2: components take colours from tokens, never from literals.
const COLOUR_LITERAL = [
  {
    selector: 'Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]',
    message: 'No hex colours in components — use a token from src/styles/tokens.scss (DESIGN.md §2).',
  },
  {
    selector: 'Literal[value=/\\b(rgb|rgba|hsl|hsla)\\(/]',
    message: 'No rgb()/hsl() colours in components — use a token from src/styles/tokens.scss (DESIGN.md §2).',
  },
];

export default defineConfig(
  globalIgnores(['node_modules', 'dist', '.empryo', 'test-results', 'playwright-report']),
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: {
      // AGENTS.md rule 6: arrow functions only.
      'func-style': ['error', 'expression'],
      'prefer-arrow-callback': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/{components,pages,layout}/**/*.{ts,tsx}'],
    rules: { 'no-restricted-syntax': ['error', ...COLOUR_LITERAL] },
  },
  {
    files: ['*.config.{js,ts}', 'scripts/**', 'e2e/**', 'tests/**'],
    languageOptions: { globals: globals.node },
  },
);
