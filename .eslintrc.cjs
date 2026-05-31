module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['plugin:vue/vue3-recommended', 'eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist', 'src/api/generated', 'public/mockServiceWorker.js', 'storybook-static', '.storybook', '*.stories.ts'],
  rules: {
    // Ionic web-component `slot` attr is a native HTML slot, not Vue deprecated slot syntax
    'vue/no-deprecated-slot-attribute': 'off',
  },
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  ],
}
