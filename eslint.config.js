const js = require('@eslint/js')
const ts = require('typescript-eslint')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const nextPlugin = require('@next/eslint-plugin-next')

module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        // Browser globals (used in 'use client' components and Next.js API routes)
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLElement: 'readonly',
        SVGSVGElement: 'readonly',
        KeyboardEvent: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      'react/prop-types': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: ts.parser,
    },
    plugins: {
      '@typescript-eslint': ts.plugin,
    },
    rules: {
      ...ts.configs.recommended.rules,
    },
  },
]
