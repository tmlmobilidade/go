/* * */

import eslintPluginJsonc from 'eslint-plugin-jsonc';
import { type Config } from 'eslint/config';

/**
 * Rules applied to JSON files to ensure
 * consistent formatting and structure.
 * Defaults to the recommended configuration from eslint-plugin-jsonc,
 * with additional stylistic rules for trailing commas and key sorting.
 */
export const jsonConfig: Config[] = [

	...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],

	{
		files: ['**/*.json'],
		rules: {
			'@stylistic/comma-dangle': ['error', 'never'],
			'jsonc/auto': 'error',
			'jsonc/sort-keys': ['error', 'asc'],
		},
	},

];
