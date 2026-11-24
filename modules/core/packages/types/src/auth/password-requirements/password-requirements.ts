/* * */

import { z } from 'zod';

/**
 * The keys for the password requirements.
 * It is intended for use in the core module.
 */
export const passwordRequirementsKeys = [
	'excessive_bytes',
	'min_length',
	'min_lower_case',
	'min_number',
	'min_special_char',
	'min_upper_case',
	'not_common_passwords',
] as const;

export type PasswordRequirementKey = typeof passwordRequirementsKeys[number];

/**
 * The shared conditions for validating a password.
 * It is intended for use in the core module.
 */
export const passwordRequirementsConditions = {
	excessive_bytes: 72,
	min_length: 8,
	min_lower_case: 1,
	min_number: 1,
	min_special_char: 1,
	min_upper_case: 1,
	not_common_passwords: ['123456789012345', 'passwordpassword', 'qwertyuiopasdfgh'],
} satisfies Record<PasswordRequirementKey, number | string[]>;

/**
 * The schema for validating a password.
 * It is intended for use in the core module.
 */
export const PasswordRequirementsSchema = z.string()
	.superRefine((value, checkPassComplexity) => {
		const errObj = {
			excessive_bytes: passwordRequirementsConditions.excessive_bytes > 0 ? {
				message: 'Password must not be too long',
				valid: Buffer.byteLength(value, 'utf8') <= passwordRequirementsConditions.excessive_bytes,
			} : undefined,
			min_length: passwordRequirementsConditions.min_length > 0 ? {
				message: `Password must be at least ${passwordRequirementsConditions.min_length} characters long`,
				valid: value.length >= passwordRequirementsConditions.min_length,
			} : undefined,
			min_lower_case: passwordRequirementsConditions.min_lower_case > 0 ? {
				message: 'Password must contain at least one lowercase character',
				valid: (value.match(/[a-z]/g) || []).length >= passwordRequirementsConditions.min_lower_case,
			} : undefined,
			min_number: passwordRequirementsConditions.min_number > 0 ? {
				message: 'Password must contain at least one number',
				valid: (value.match(/\d/g) || []).length >= passwordRequirementsConditions.min_number,
			} : undefined,
			min_special_char: passwordRequirementsConditions.min_special_char > 0 ? {
				message: 'Password must contain at least one special character',
				valid: (value.match(/[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/g) || []).length >= passwordRequirementsConditions.min_special_char,
			} : undefined,
			min_upper_case: passwordRequirementsConditions.min_upper_case > 0 ? {
				message: 'Password must contain at least one uppercase character',
				valid: (value.match(/[A-Z]/g) || []).length >= passwordRequirementsConditions.min_upper_case,
			} : undefined,
			not_common_passwords: passwordRequirementsConditions.not_common_passwords.length > 0 ? {
				message: 'Password must not be a common password',
				valid: !passwordRequirementsConditions.not_common_passwords.includes(value),
			} : undefined,
		} satisfies Record<PasswordRequirementKey, undefined | { message: string, valid: boolean }>;
		Object
			.entries(errObj)
			.filter(([, rule]) => rule?.valid === false)
			.forEach(([key]) => checkPassComplexity.addIssue({ code: 'custom', message: key }));
	});
