/* * */

import { z } from 'zod';

/**
 * The shared conditions for validating a password.
 * It is intended for use in the core module.
 */
const sharedConditions = {
	excessive_bytes: 72,
	min_length: 8,
	min_lower_case: 1,
	min_number: 1,
	min_special_char: 1,
	min_upper_case: 1,
	not_common_passwords: ['123456789012345', 'passwordpassword', 'qwertyuiopasdfgh'],
};

/**
 * The schema for validating a password.
 * It is intended for use in the core module.
 */
export const PasswordRequirementsSchema = z.string()
	.superRefine((value, checkPassComplexity) => {
		const errObj = {
			excessive_bytes: sharedConditions.excessive_bytes > 0 ? {
				message: 'Password must not be too long',
				valid: Buffer.byteLength(value, 'utf8') <= sharedConditions.excessive_bytes,
			} : undefined,
			min_length: sharedConditions.min_length > 0 ? {
				message: `Password must be at least ${sharedConditions.min_length} characters long`,
				valid: value.length >= sharedConditions.min_length,
			} : undefined,
			min_lower_case: sharedConditions.min_lower_case > 0 ? {
				message: 'Password must contain at least one lowercase character',
				valid: (value.match(/[a-z]/) || []).length >= sharedConditions.min_lower_case,
			} : undefined,
			min_number: sharedConditions.min_number > 0 ? {
				message: 'Password must contain at least one number',
				valid: (value.match(/\d/) || []).length >= sharedConditions.min_number,
			} : undefined,
			min_special_char: sharedConditions.min_special_char > 0 ? {
				message: 'Password must contain at least one special character',
				valid: (value.match(/[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/) || []).length >= sharedConditions.min_special_char,
			} : undefined,
			min_upper_case: sharedConditions.min_upper_case > 0 ? {
				message: 'Password must contain at least one uppercase character',
				valid: (value.match(/[A-Z]/) || []).length >= sharedConditions.min_upper_case,
			} : undefined,
			not_common_passwords: sharedConditions.not_common_passwords.length > 0 ? {
				message: 'Password must not be a common password',
				valid: !sharedConditions.not_common_passwords.includes(value),
			} : undefined,
		};
		checkPassComplexity.addIssue({
			code: z.ZodIssueCode.custom,
			message: JSON.stringify(errObj),
			path: [],
		});
	});
