/* * */

import { z } from 'zod';

/* * */

export const AuthLoginRequestSchema = z.object({
	password: z.string(),
	token: z.string().email(),
});

/**
 * The request schema for logging in.
 * It is intended for use in the core module.
 */
export type AuthLoginRequest = z.infer<typeof AuthLoginRequestSchema>;
