import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'

const storageGlobals = ['localStorage', 'sessionStorage']

export default [
  { ignores: ['dist', 'coverage', 'node_modules', 'playwright-report', 'screenshots'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'tests/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, __APP_VERSION__: 'readonly', __BUILD_DATE__: 'readonly' },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      'react/prop-types': 'off',
      'react/no-danger': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-script-url': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_|^React$' }],
      'no-console': ['error', { allow: [] }],
      // Browser storage is reachable only through src/lib/storage.js
      'no-restricted-globals': ['error', ...storageGlobals.map((name) => ({ name, message: 'Use src/lib/storage.js' }))],
      'no-restricted-properties': [
        'error',
        ...storageGlobals.flatMap((object) => [
          { object: 'window', property: object, message: 'Use src/lib/storage.js' },
          { object: 'globalThis', property: object, message: 'Use src/lib/storage.js' },
        ]),
      ],
    },
  },
  { ...jsxA11y.flatConfigs.recommended, files: ['src/**/*.{js,jsx}'] },
  { files: ['src/lib/storage.js'], rules: { 'no-restricted-globals': 'off', 'no-restricted-properties': 'off' } },
  {
    files: ['tests/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...globals.vitest } },
    rules: { 'no-console': 'off', 'no-restricted-globals': 'off', 'no-restricted-properties': 'off', 'react/display-name': 'off' },
  },
  {
    files: ['tools/**/*.mjs', 'vite.config.js', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
    rules: { 'no-console': 'off' },
  },
  {
    files: ['public/**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: { ...globals.browser, ...globals.serviceworker } },
    rules: { 'no-console': 'off' },
  },
]
