/* * */

import { z } from 'zod';

/* * */

export const AuthLoginRequestSchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

/**
 * The request schema for logging in.
 * It is intended for use in the core module.
 */
export type AuthLoginRequest = z.infer<typeof AuthLoginRequestSchema>;
