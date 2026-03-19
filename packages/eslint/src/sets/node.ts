/* * */

import commonRule from '@/sets/common.js';
import globals from 'globals';

/* * */

export default [

	...commonRule,

	// Backend-specific configurations
	{
		files: ['**/*.{js,ts}'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
		name: 'Node.js Backend Rules',
		rules: {
			// Backend-specific naming conventions
			// '@typescript-eslint/naming-convention': [
			// 	'error',
			// 	// API route functions: camelCase
			// 	{
			// 		format: ['camelCase'],
			// 		selector: 'function',
			// 	},
			// 	// Database models/schemas: PascalCase
			// 	{
			// 		format: ['PascalCase'],
			// 		selector: 'class',
			// 	},
			// 	// Database field types (when using snake_case in DB)
			// 	{
			// 		filter: {
			// 			match: true,
			// 			regex: '^(id|created_at|updated_at|user_id|route_id)$', // Common DB fields
			// 		},
			// 		format: null, // Allow snake_case for DB fields
			// 		selector: 'objectLiteralProperty',
			// 	},
			// 	// Environment variables: SCREAMING_SNAKE_CASE
			// 	{
			// 		filter: {
			// 			match: true,
			// 			regex: '^(NODE_ENV|DATABASE_URL|API_KEY|JWT_SECRET)$',
			// 		},
			// 		format: ['UPPER_CASE'],
			// 		selector: 'variable',
			// 	},
			// 	// Constants: SCREAMING_SNAKE_CASE or camelCase
			// 	{
			// 		format: ['UPPER_CASE', 'camelCase', 'PascalCase'], // Allow both for flexibility
			// 		modifiers: ['const', 'exported'],
			// 		selector: 'variable',
			// 	},
			// ],

			// Backend-specific rules
			'@typescript-eslint/no-explicit-any': 'warn', // More lenient for API responses
			'@typescript-eslint/no-misused-promises': 'off', // Allow promises to not be awaited in backend
			'no-console': 'off', // Allow console in backend for logging
		},
	},
];
