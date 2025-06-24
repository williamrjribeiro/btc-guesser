import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';

const files = ['**/*.{js,jsx,ts,tsx}'];
export default defineConfig([
  globalIgnores(['.pnpm-store/', './src/web-ui/dist/', '.sst/']),
  {
    files,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  { files: ['**/*.{js,ts}'], plugins: { js }, extends: ['js/recommended'] },
  { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
  tseslint.config(tseslint.configs.recommended, {
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off', // For SST Config
    },
  }),
  {
    files,
    plugins: { react },
    rules: {
      ...react.configs['jsx-runtime'].rules,
    },
  },
  {
    files,
    plugins: { 'jsx-a11y': jsxA11y },
    rules: { ...jsxA11y.configs.recommended.rules },
  },
  eslintConfigPrettier,
]);
