/* * */

import { next } from '@tmlmobilidade/eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y'

/* * */

const accessibilityRules = Object.fromEntries(
  Object.entries(jsxA11y.flatConfigs.recommended.rules).map(([ruleName, ruleConfig]) => [
    ruleName,
    Array.isArray(ruleConfig) ? ['warn', ...ruleConfig.slice(1)] : 'warn',
  ]),
)

/* * */

export default [
  ...next,
  {
    files: ['src/**/*.{jsx,tsx}'],
    name: 'Navegante accessibility rules',
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...accessibilityRules,
      'jsx-a11y/no-autofocus': ['warn', { ignoreNonDOM: true }],
    },
  },
]
