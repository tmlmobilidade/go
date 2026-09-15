/* * */

import { next } from '@tmlmobilidade/eslint'

/* * */

export default [
  ...next,
  {
    // Next.js route handlers must be named after the HTTP method (GET, POST, ...)
    files: ['src/app/**/route.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
]
