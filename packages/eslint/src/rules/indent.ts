/* * */

import { type Config } from 'eslint/config';

/**
 * Enforces consistent indentation using tabs across all file types.
 */
export const indentConfig: Config[] = [

	{
		// files: ['**/*.*'], // Leave disabled to apply to all file types.
		rules: {
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/no-mixed-spaces-and-tabs': 'error',
			'@stylistic/no-tabs': 'off',
			'@stylistic/operator-linebreak': 'off',
			'indent': 'off',
		},
	},

	{
		files: ['**/*.tsx', '**/*.jsx'],
		rules: {
			// JSX Indentation and formatting
			'@stylistic/jsx-indent': ['error', 'tab', {
				checkAttributes: true,
				indentLogicalExpressions: true,
			}],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
		},
	},

];
