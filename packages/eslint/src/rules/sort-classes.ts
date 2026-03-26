/* * */

import { type Config } from 'eslint/config';

/**
 * Enforces consistent class member ordering across all file types.
 */
export const sortClassesConfig: Config[] = [

	{
		files: ['**/*.{js,ts}'],
		rules: {
			'@stylistic/lines-between-class-members': 'off',
			'perfectionist/sort-classes': [
				'error',
				// Variables and functions: camelCase
				{
					fallbackSort: { order: 'asc', type: 'subgroup-order' },
					groups: [
						'index-signature',
						// 'static-block',

						// static properties
						{ group: 'static-public-readonly-property', newlinesInside: 0 },
						{ group: 'static-public-property', newlinesInside: 0 },
						{ group: 'static-protected-readonly-property', newlinesInside: 0 },
						{ group: 'static-protected-property', newlinesInside: 0 },
						{ group: 'static-private-readonly-property', newlinesInside: 0 },
						{ group: 'static-private-property', newlinesInside: 0 },
						{ group: 'static-property', newlinesInside: 0 },

						// abstract properties
						{ group: 'abstract-public-readonly-property', newlinesInside: 0 },
						{ group: 'abstract-public-property', newlinesInside: 0 },
						{ group: 'abstract-protected-readonly-property', newlinesInside: 0 },
						{ group: 'abstract-protected-property', newlinesInside: 0 },
						{ group: 'abstract-private-readonly-property', newlinesInside: 0 },
						{ group: 'abstract-private-property', newlinesInside: 0 },
						{ group: 'abstract-property', newlinesInside: 0 },

						// public properties
						{ group: 'public-override-readonly-property', newlinesInside: 0 },
						{ group: 'public-override-property', newlinesInside: 0 },
						{ group: 'public-readonly-property', newlinesInside: 0 },
						{ group: 'public-property', newlinesInside: 0 },
						{ group: 'property', newlinesInside: 0 },

						// protected properties
						{ group: 'protected-override-readonly-property', newlinesInside: 0 },
						{ group: 'protected-override-property', newlinesInside: 0 },
						{ group: 'protected-readonly-property', newlinesInside: 0 },
						{ group: 'protected-property', newlinesInside: 0 },

						// private properties
						{ group: 'private-override-readonly-property', newlinesInside: 0 },
						{ group: 'private-override-property', newlinesInside: 0 },
						{ group: 'private-readonly-property', newlinesInside: 0 },
						{ group: 'private-property', newlinesInside: 0 },

						'constructor',

						// get methods
						{ group: 'get-method', newlinesInside: 1 },
						{ group: 'protected-get-method', newlinesInside: 1 },
						{ group: 'private-get-method', newlinesInside: 1 },

						// set methods
						{ group: 'set-method', newlinesInside: 1 },
						{ group: 'protected-set-method', newlinesInside: 1 },
						{ group: 'private-set-method', newlinesInside: 1 },

						['static-method', 'static-function-property'],
						['protected-static-method', 'protected-static-function-property'],
						['private-static-method', 'private-static-function-property'],

						['method', 'function-property'],
						['protected-method', 'protected-function-property'],
						['private-method', 'private-function-property'],

						'unknown',
					],
					newlinesBetween: 1,
					newlinesInside: 1,
					partitionByComment: true,
					type: 'alphabetical',
				},
			],
		},
	},

];
