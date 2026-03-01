/* * */

import { type Config } from 'eslint/config';

/**
 * ESLint rules related to promises and async/await usage, based on the recommended rules from @typescript-eslint.
 * These rules help ensure that promises are handled correctly and that async functions are used properly.
 * The rules are applied to both TypeScript and JavaScript files, but they require type checking,
 * so they are only enabled for TypeScript files. For JavaScript files, these rules are disabled
 * to avoid false positives due to the lack of type information.
 */
export const promisesConfig: Config[] = [

	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				project: true,
			},
		},
		rules: {

			'@typescript-eslint/await-thenable': 'error',

			'@typescript-eslint/no-floating-promises': [
				'error',
				{ ignoreIIFE: true },
			],

			'@typescript-eslint/no-misused-promises': [
				'error',
				{
					checksVoidReturn: {
						arguments: false,
						attributes: false,
						properties: false,
					},
				},
			],

			'@typescript-eslint/switch-exhaustiveness-check': 'error',

		},
	},

];
