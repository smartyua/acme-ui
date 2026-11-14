// Design lint: the parts of DESIGN.md that can be checked statically in SCSS.
// Run with `npm run lint:design`. Deliberately not a style/formatting config.
const TOKENS = 'use a token from src/styles/tokens.scss; new colours go into both theme blocks of globals.scss (DESIGN.md §2–3)';

export default {
  customSyntax: 'postcss-scss',
  rules: {
    'color-no-hex': [true, { message: `No hex colours in component styles — ${TOKENS}.` }],
    'color-named': ['never', { ignore: ['inside-function'], message: `No named colours in component styles — ${TOKENS}.` }],
    'function-disallowed-list': [
      ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch'],
      { message: `No colour literals in component styles — ${TOKENS}; derive variants with color-mix().` },
    ],
    'media-feature-name-disallowed-list': [
      ['width', 'min-width', 'max-width', 'device-width', 'min-device-width', 'max-device-width'],
      { message: 'No raw width media queries — use the bp.* mixins from src/styles/_breakpoints.scss (DESIGN.md §5).' },
    ],
  },
  overrides: [
    // The palette is the one place colour literals live.
    {
      files: ['src/styles/globals.scss'],
      rules: { 'color-no-hex': null, 'color-named': null, 'function-disallowed-list': null },
    },
    // The mixins are the one place width queries live.
    { files: ['src/styles/_breakpoints.scss'], rules: { 'media-feature-name-disallowed-list': null } },
  ],
};
