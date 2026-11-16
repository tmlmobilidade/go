/* * */

import { type ValidationKey, validationParams, type ValidationValues } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

/* * */

export interface PasswordRequirement {
	key: ValidationKey
	valid: boolean
	values: ValidationValues
}

/** Structured checklist data, independent of the user's language. */
export function getPasswordRequirements(password: string): PasswordRequirement[] {
	return [
		{ key: 'custom.password.min_length', valid: password.length >= 8, values: { minimum: 8 } },
		{ key: 'custom.password.lowercase', valid: /[a-z]/.test(password), values: {} },
		{ key: 'custom.password.number', valid: /\d/.test(password), values: {} },
		{ key: 'custom.password.special', valid: /[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/.test(password), values: {} },
		{ key: 'custom.password.uppercase', valid: /[A-Z]/.test(password), values: {} },
	];
}

// Preserve the legacy checklist schema's behavior: it emits the checklist even
// when every condition passes. Consumers read structured data, never JSON text.
export const PasswordRequirementsSchema = z
	.object({ password: z.string() })
	.superRefine(({ password }, context) => {
		context.addIssue({
			code: 'custom',
			params: {
				...validationParams('custom.password.requirements').params,
				requirements: getPasswordRequirements(password),
			},
			path: ['password'],
		});
	});
