// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: [
    '/dist/*',
    'scripts/**',
  ],
  rules: {
    // Resolve TS path aliases with tsc; avoid false positives
    'import/no-unresolved': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', 'jest.config.js', 'jest.setup.js'],
      env: { jest: true, node: true, browser: true },
      rules: {},
    },
    {
      files: ['scripts/**/*.{js,ts}', 'test-*.js'],
      env: { node: true },
      rules: {
        // scripts may use duplicate keys for mapping tables
        'no-dupe-keys': 'off',
      },
    },
  ],
};
