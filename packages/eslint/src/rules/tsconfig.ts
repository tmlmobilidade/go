/* * */

import { type Config } from 'eslint/config';

/**
 * Rules applied to `tsconfig.json` files to ensure
 * consistent formatting and structure.
 */
export const tsconfigConfig: Config[] = [

	{
		files: ['**/tsconfig.json'],
		rules: {
			'@stylistic/comma-dangle': ['error', 'never'],
			'jsonc/auto': 'error',
			'jsonc/sort-keys': [
				'error',
				{
					order: [
						'extends',
						'compilerOptions',
						'include',
						'exclude',
					],
					pathPattern: '^$',
				},
				{
					order: { type: 'asc' },
					pathPattern: '.*',
				},
			],
		},
	},

];
