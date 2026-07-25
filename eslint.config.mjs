// @ts-check
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

/**
 * Reglas que hacen CUMPLIR el EQUIPO.md:
 *  - `no-explicit-any`       -> regla 8.
 *  - `no-restricted-imports` -> regla 4 (aislamiento de features): una feature
 *                               solo se importa por su `index.ts` publico.
 */
export default tseslint.config(
  // `eslint.config.mjs` se excluye del linting TIPADO: los `configs.*TypeChecked`
  // se aplican a TODO archivo por defecto (no traen `files`), y este `.mjs` no
  // esta cubierto por `tsconfig.node.json`/`projectService` como los `.ts`. Sin
  // esto, `npm run lint` explota al intentar tipar su propio config.
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'eslint.config.mjs'] },

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Las reglas con tipos solo pueden correr sobre archivos que esten en un
  // tsconfig. Este propio archivo y cualquier .js/.mjs no lo estan, asi que se
  // les apagan: si no, ESLint muere al arrancar.
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',

      // Regla 4: cruza features SOLO por su API publica (`@features/x`),
      // nunca por `@features/x/ui/...`.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@features/*/ui/*',
                '@features/*/model/*',
                '@features/*/api/*',
                '../../*/ui/*',
                '../../*/model/*',
                '../../*/api/*',
              ],
              message:
                'AISLAMIENTO DE FEATURES (regla 4): importa la feature por su index.ts publico (@features/lead-intake), no sus internals.',
            },
          ],
        },
      ],
    },
  },

  // El contrato es dominio puro: sin React, sin fetch, sin frameworks.
  {
    files: ['src/shared/contracts.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['*'] }],
    },
  },

  {
    files: ['**/*.{test,spec}.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },

  prettier,
);
