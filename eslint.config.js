import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Configuración base de ESLint
  js.configs.recommended,
  // Configuración recomendada para TypeScript
  ...tseslint.configs.recommended,
  // Configuración de Prettier
  prettierConfig,
  // Reglas personalizadas
  {
    files: ['**/*.ts'],
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  // Archivos a ignorar
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
      '**/*.test.ts',
      '**/__tests__/**'
    ]
  }
);
