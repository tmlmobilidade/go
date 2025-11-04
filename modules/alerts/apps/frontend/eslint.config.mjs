/* * */

import { next } from '@carrismetropolitana/eslint'

/* * */

export default [
  ...next,
  {
    ignores: [
      '.next/',
      'public/',
      'assets/',
      'public/',
    ],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
]
