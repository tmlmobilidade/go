/* * */

import { z } from 'zod';

/* * */

export const AuthSendPasswordResetEmailRequestSchema = z.object({
	email: z.string().email(),
});

/**
 * The request schema for sending a password reset email.
 * It is intended for use in the core module.
 */
export type AuthSendPasswordResetEmailRequest = z.infer<typeof AuthSendPasswordResetEmailRequestSchema>;
