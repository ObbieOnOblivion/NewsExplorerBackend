// eslint.config.js
import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier';

export default [
  // Base ESLint recommended config
  js.configs.recommended,
  
  // TypeScript config
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': ts
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      ...ts.configs['recommended'].rules,
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },
  
  // Import/export rules
  {
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'import/order': [
        'error', 
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc' }
        }
      ]
    }
  },
  
  // Global Node.js settings
  {
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-console': 'warn'
    }
  },
  
  // Prettier (must be last)
  prettier
];