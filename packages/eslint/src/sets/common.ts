/* * */

import { indentConfig } from '@/rules/indent.js';
import { jsonConfig } from '@/rules/json.js';
import { namingConventionsConfig } from '@/rules/naming-conventions.js';
import { packageJsonConfig } from '@/rules/pjson.js';
import { promisesConfig } from '@/rules/promises.js';
import { sortClassesConfig } from '@/rules/sort-classes.js';
import { tsconfigConfig } from '@/rules/tsconfig.js';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import perfectionist from 'eslint-plugin-perfectionist';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/* * */

export default defineConfig([

	// Ignore patterns
	{
		ignores: [
			'**/build/**',
			'**/dist/**',
			'**/node_modules/**',
			'**/.next/**',
			'**/public/**',
			'**/*lock.json',
		],
	},

	// Base configurations
	eslint.configs.recommended,

	...tseslint.configs.strict,

	// Plugins setup
	{
		plugins: {
			'@stylistic': stylistic,
			'import': eslintPluginImport,
		},
	},

	// Plugin configurations
	perfectionist.configs['recommended-natural'],
	stylistic.configs['recommended'],

	// Language options
	{
		languageOptions: {
			ecmaVersion: 'latest',
			globals: {
				...globals.node,
			},
			parser: tseslint.parser,
			parserOptions: {
				project: true,
			},
			sourceType: 'module',
		},
	},

	// Disable type-checked rules for JS files
	{
		files: ['**/*.{js,jsx,cjs,mjs}'],
		...tseslint.configs.disableTypeChecked,
		languageOptions: {
			parserOptions: {
				project: false,
			},
		},
	},

	// Common rules for all files
	{
		files: ['**/*.{js,jsx,cjs,mjs,ts,tsx}'],
		rules: {
			// Core language rules
			'eqeqeq': ['error', 'always', { null: 'ignore' }],
			'no-console': 'warn',
			'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0, maxEOF: 1 }],

			// TypeScript specific rules (non-type-checking ones)
			'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-extraneous-class': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'import/no-extraneous-dependencies': ['error', {
				packageDir: ['.'],
			}],

			// Code style rules
			'@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
			'@stylistic/comma-dangle': ['error', 'always-multiline'],
			'@stylistic/key-spacing': ['error', {
				afterColon: true,
				beforeColon: false,
				mode: 'strict',
			}],
			'@stylistic/multiline-ternary': 'off',
			'@stylistic/semi': ['error', 'always', { omitLastInOneLineBlock: false }],
			'@stylistic/spaced-comment': ['error', 'always', {
				block: {
					balanced: true,
					exceptions: ['*'],
					markers: ['!', '*'],
				},
				line: {
					exceptions: ['/', '-', '*', '='],
					markers: ['/'],
				},
			}],

			// Import sorting and organization
			'perfectionist/sort-imports': ['error', {
				groups: [
					['type'],
					['builtin', 'external', 'internal'],
					['style'],
					['import'],
				],
				ignoreCase: true,
				order: 'asc',
				partitionByComment: true,
				specialCharacters: 'keep',
				type: 'natural',
			}],
			'perfectionist/sort-modules': 'off',
			'perfectionist/sort-objects': ['error', { partitionByComment: true }],

			// Component structure and organization (prefer-const already enabled by base config)
		},
	},

	...promisesConfig,

	...sortClassesConfig,

	...namingConventionsConfig,

	...jsonConfig,

	...packageJsonConfig,

	...tsconfigConfig,

	...indentConfig,

]);
