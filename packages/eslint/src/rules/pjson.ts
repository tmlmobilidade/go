/* * */

import { type Config } from 'eslint/config';

/**
 * Rules applied to `package.json` files to ensure
 * consistent formatting and structure.
 */
export const packageJsonConfig: Config[] = [

	{
		files: ['**/package.json'],
		rules: {
			'jsonc/sort-keys': [
				'error',
				{
					order: [
						'name',
						'description',
						'version',
						'author',
						'license',
						'homepage',
						'bugs',
						'repository',
						'keywords',
						'private',
						'publishConfig',
						'type',
						'files',
						'main',
						'types',
						'exports',
						'scripts',
						'dependencies',
						'devDependencies',
					],
					pathPattern: '^$',
				},
				{
					hasProperties: ['types', 'import'],
					order: ['types', 'import'],
					pathPattern: '.*',
				},
				{
					hasProperties: ['types', 'default'],
					order: ['types', 'default'],
					pathPattern: '.*',
				},
				{
					order: { type: 'asc' },
					pathPattern: '.*',
				},
			],
		},
	},

];
