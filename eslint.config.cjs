/** @type {import('eslint').Linter.FlatConfig} */
const { ESLint } = require('eslint');

const config = [
  {
    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
      globals: {
        browser: 'readonly',
      },
    },
    files: ['**/*.js'], // Atur file yang ingin dilint
    rules: {
      // Aturan tambahan jika diperlukan
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      // Aturan dari eslint:recommended
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      // Tambahkan aturan lain sesuai kebutuhan
    },
  },
  {
    files: ['**/*.js'],
    plugins: {
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];

module.exports = config;
