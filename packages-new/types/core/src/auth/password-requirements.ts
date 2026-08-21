/* * */

import { z } from 'zod';

/* * */

const sharedConditions = {
	minLength: 8,
	minLowerCase: 1,
	minNumber: 1,
	minSpecialChar: 1,
	minUpperCase: 1,
};

export const PasswordRequirementsSchema = z
	.object({ password: z.string() })
	.superRefine(({ password }, checkPassComplexity) => {
		const errObj = {
			minLength: sharedConditions.minLength > 0 ? {
				message: `Password must be at least ${sharedConditions.minLength} characters long`,
				valid: password.length >= sharedConditions.minLength,
			} : undefined,
			minLowerCase: sharedConditions.minLowerCase > 0 ? {
				message: 'Password must contain at least one lowercase character',
				valid: (password.match(/[a-z]/) || []).length >= sharedConditions.minLowerCase,
			} : undefined,
			minNumber: sharedConditions.minNumber > 0 ? {
				message: 'Password must contain at least one number',
				valid: (password.match(/\d/) || []).length >= sharedConditions.minNumber,
			} : undefined,
			minSpecialChar: sharedConditions.minSpecialChar > 0 ? {
				message: 'Password must contain at least one special character',
				valid: (password.match(/[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/) || []).length >= sharedConditions.minSpecialChar,
			} : undefined,
			minUpperCase: sharedConditions.minUpperCase > 0 ? {
				message: 'Password must contain at least one uppercase character',
				valid: (password.match(/[A-Z]/) || []).length >= sharedConditions.minUpperCase,
			} : undefined,
		};

		checkPassComplexity.addIssue({ code: z.ZodIssueCode.custom, message: JSON.stringify(errObj), path: ['password'] });
	});
