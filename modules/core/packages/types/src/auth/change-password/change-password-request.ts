/* * */

import { z } from 'zod';

/* * */

export const AuthChangePasswordRequestSchema = z.object({
	password: z.string(),
	token: z.string(),
});

/**
 * The request schema for changing a password.
 * It is intended for use in the core module.
 */
export type AuthChangePasswordRequest = z.infer<typeof AuthChangePasswordRequestSchema>;
