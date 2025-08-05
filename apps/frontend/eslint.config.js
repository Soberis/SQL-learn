import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescriptParser from '@typescript-eslint/parser'
import tseslint from '@typescript-eslint/eslint-plugin'
import prettierRecommended from 'eslint-config-prettier'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    name: 'typescript',
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript规则 - 宽松配置
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Vue规则 - 宽松配置
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/require-prop-types': 'off',

      // 通用规则 - 宽松配置
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'no-prototype-builtins': 'off',
    },
  },
  {
    name: 'vue-typescript',
    files: ['**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: {
          ts: typescriptParser,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript规则 - 宽松配置
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Vue规则 - 宽松配置
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/require-prop-types': 'off',

      // 通用规则 - 宽松配置
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'no-prototype-builtins': 'off',
    },
  },
  prettierRecommended,
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '*.config.js', '.vercel/**/*', 'public/**/*'],
  },
]
