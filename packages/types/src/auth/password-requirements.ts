/* * */

import { z } from 'zod';

/* * */

export const PasswordRequirementsSchema = z
	.object({
		password: z.string(),
	})
	.superRefine(({ password }, checkPassComplexity) => {
		const CONDITIONS = {
			minLength: 8,
			minLowerCase: 1,
			minNumber: 1,
			minSpecialChar: 1,
			minUpperCase: 1,
		};

		const errObj = {
			minLength: CONDITIONS.minLength > 0 ? {
				message: `Password must be at least ${CONDITIONS.minLength} characters long`,
				valid: password.length >= CONDITIONS.minLength,
			} : undefined,
			minLowerCase: CONDITIONS.minLowerCase > 0 ? {
				message: 'Password must contain at least one lowercase character',
				valid: (password.match(/[a-z]/) || []).length >= CONDITIONS.minLowerCase,
			} : undefined,
			minNumber: CONDITIONS.minNumber > 0 ? {
				message: 'Password must contain at least one number',
				valid: (password.match(/\d/) || []).length >= CONDITIONS.minNumber,
			} : undefined,
			minSpecialChar: CONDITIONS.minSpecialChar > 0 ? {
				message: 'Password must contain at least one special character',
				valid: (password.match(/[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/) || []).length >= CONDITIONS.minSpecialChar,
			} : undefined,
			minUpperCase: CONDITIONS.minUpperCase > 0 ? {
				message: 'Password must contain at least one uppercase character',
				valid: (password.match(/[A-Z]/) || []).length >= CONDITIONS.minUpperCase,
			} : undefined,
		};

		checkPassComplexity.addIssue({ code: z.ZodIssueCode.custom, message: JSON.stringify(errObj), path: ['password'] });
	});

export type PasswordRequirements = z.infer<typeof PasswordRequirementsSchema>;
