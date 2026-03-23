/* * */

import perfectionist from 'eslint-plugin-perfectionist';
import { type Config } from 'eslint/config';

/**
 * Enforces consistent class member ordering across all file types.
 */
export const sortClassesConfig: Config[] = [

	{
		files: ['**/*.{ts}'],
		plugins: {
			perfectionist,
		},
		rules: {
			'perfectionist/sort-classes': [
				'error',
				// Variables and functions: camelCase
				{
					fallbackSort: { order: 'asc', type: 'subgroup-order' },
					groups: [
						'index-signature',

						['static-property', 'static-accessor-property'],
						['static-get-method', 'static-set-method'],

						['protected-static-property', 'protected-static-accessor-property'],
						['protected-static-get-method', 'protected-static-set-method'],

						['private-static-property', 'private-static-accessor-property'],
						['private-static-get-method', 'private-static-set-method'],

						'static-block',

						// normal properties
						['property', 'accessor-property'],

						['get-method', 'set-method'],

						// abstract protected properties grouped together here
						['protected-abstract-property'],

						// then regular protected properties
						['protected-property', 'protected-accessor-property'],
						['protected-get-method', 'protected-set-method'],

						['private-property', 'private-accessor-property'],
						['private-get-method', 'private-set-method'],

						'constructor',

						['static-method', 'static-function-property'],
						['protected-static-method', 'protected-static-function-property'],
						['private-static-method', 'private-static-function-property'],

						['method', 'function-property'],
						['protected-method', 'protected-function-property'],
						['private-method', 'private-function-property'],

						'unknown',
					],
					newlinesBetween: 2,
					type: 'alphabetical',
				},
			],
		},
	},

];
