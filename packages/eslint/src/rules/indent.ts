/* * */

import { type Config } from 'eslint/config';

/**
 * Enforces consistent indentation using tabs across all file types.
 */
export const indentConfig: Config[] = [

	{
		// files: ['**/*.*'], // Leave disable to apply to all file types.
		rules: {
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/no-mixed-spaces-and-tabs': 'error',
			'@stylistic/no-tabs': 'off',
			'@stylistic/operator-linebreak': 'off',
			'indent': 'off',
		},
	},

];
