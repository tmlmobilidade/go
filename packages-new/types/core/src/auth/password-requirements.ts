/* * */

import { z } from 'zod';

/* * */

const sharedConditions = {
	minLength: 15,
	minLowerCase: 0,
	minNumber: 0,
	minSpecialChar: 0,
	minUpperCase: 0,
};

export const PasswordRequirementsSchema = z
	.object({ password: z.string() })
	.superRefine(({ password }, checkPassComplexity) => {
		const errObj = {
			commonPassword: {
				message: 'Choose a less common password',
				valid: !['123456789012345', 'passwordpassword', 'qwertyuiopasdfgh'].includes(password.toLowerCase()),
			},
			maxBytes: {
				message: 'Password must be at most 72 UTF-8 bytes',
				valid: new TextEncoder().encode(password).length <= 72,
			},
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

		if (Object.values(errObj).some(condition => condition && !condition.valid)) checkPassComplexity.addIssue({ code: z.ZodIssueCode.custom, message: JSON.stringify(errObj), path: ['password'] });
	});
