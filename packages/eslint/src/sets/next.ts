/* * */

import commonRule from '@/sets/common.js';
import nextPlugin from '@next/eslint-plugin-next';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import globals from 'globals';

/* * */

export default [

	...commonRule,

	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
		},
	},

	// JSX/TSX Styling Rules
	{
		files: ['**/*.tsx', '**/*.jsx'],
		name: 'JSX Styling for Next.js',
		rules: {
			// JSX Indentation and formatting
			'@stylistic/jsx-indent': ['error', 'tab', {
				checkAttributes: true,
				indentLogicalExpressions: true,
			}],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
			'@stylistic/jsx-one-expression-per-line': 'off',
			'@stylistic/jsx-quotes': ['error', 'prefer-double'],
			'@stylistic/jsx-self-closing-comp': ['error', {
				component: true,
				html: true,
			}],

			// JSX Props organization
			'@stylistic/jsx-sort-props': ['error', {
				ignoreCase: true,
				multiline: 'last',
				reservedFirst: ['key', 'ref'],
				shorthandLast: true,
			}],
			'perfectionist/sort-jsx-props': 'off',

			// JSX Best practices
			'@stylistic/jsx-closing-bracket-location': ['error', 'tag-aligned'],
			'@stylistic/jsx-closing-tag-location': 'error',
			'@stylistic/jsx-curly-brace-presence': ['error', {
				children: 'never',
				props: 'never',
			}],
			'@stylistic/jsx-equals-spacing': ['error', 'never'],
		},
	},

	// Next.js Plugin Configuration
	{
		name: 'Next.js Plugin',
		plugins: {
			'@next/next': nextPlugin,
		},
		rules: {
			// Next.js Core Rules
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,

			// Enhanced Next.js rules
			'@next/next/no-html-link-for-pages': 'error',
			'@next/next/no-img-element': 'error',
		},
	},

	// React Plugin Configuration
	{
		files: ['**/*.tsx', '**/*.jsx'],
		name: 'React Rules for Next.js',
		plugins: {
			'react': reactPlugin,
			'react-hooks': reactHooksPlugin,
		},
		rules: {
			// JSX Rules
			'react-hooks/exhaustive-deps': 'warn',
			'react-hooks/rules-of-hooks': 'error',
			'react/jsx-key': 'error',

			'react/no-children-prop': 'error',
			'react/no-unescaped-entities': 'error',

			// Frontend-specific naming conventions
			'@typescript-eslint/naming-convention': [
				'error',
				// React Components: PascalCase
				{
					filter: {
						match: true,
						regex: '^[A-Z]', // Functions starting with capital (React components)
					},
					format: ['PascalCase'],
					selector: 'function',
				},
				// React hooks: camelCase starting with 'use'
				{
					filter: {
						match: true,
						regex: '^use[A-Z]',
					},
					format: ['camelCase'],
					selector: 'function',
				},
				// Props interfaces: PascalCase ending with Props
				{
					filter: {
						match: true,
						regex: 'Props$',
					},
					format: ['PascalCase'],
					selector: 'interface',
				},
			],
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},

];
