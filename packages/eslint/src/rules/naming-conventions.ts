/* * */

import { type Config } from 'eslint/config';

/**
 * Enforces consistent naming conventions across all file types.
 */
export const namingConventionsConfig: Config[] = [

	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				// Variables and functions: camelCase
				{
					format: ['camelCase'],
					leadingUnderscore: 'allow',
					selector: 'variableLike',
				},
				{
					format: ['camelCase'],
					selector: 'function',
				},
				// Global variables and constants: UPPER_CASE
				{
					format: ['UPPER_CASE'],
					modifiers: ['global'],
					selector: 'variable',
				},
				// Constants: SCREAMING_SNAKE_CASE
				{
					format: ['UPPER_CASE', 'camelCase', 'PascalCase'], // Allow both for flexibility
					modifiers: ['const', 'global'],
					selector: 'variable',
				},
				// Types and interfaces: PascalCase
				{
					format: ['PascalCase'],
					selector: 'typeLike',
				},
				// Class members: camelCase
				{
					format: ['camelCase'],
					selector: 'classMethod',
				},
				{
					format: ['camelCase'],
					leadingUnderscore: 'allow',
					selector: 'classProperty',
				},
				// Enum members: PascalCase or UPPER_CASE
				{
					format: ['PascalCase', 'UPPER_CASE'],
					selector: 'enumMember',
				},
			],
		},
	},

	{
		files: ['**/*.tsx'],
		rules: {
			'@typescript-eslint/naming-convention': [
				'error',
				{
					format: ['PascalCase'],
					leadingUnderscore: 'allow',
					selector: 'function',
				},
			],
		},
	},

];
