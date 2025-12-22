/* * */

import { DocumentSchema } from '@/_common/document.js';
import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const VerificationTokenSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		expires_at: UnixTimeStampSchema,
		token: z.string(),
		user_id: z.string(),
	});

export const CreateVerificationTokenSchema = VerificationTokenSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateVerificationTokenSchema = CreateVerificationTokenSchema.omit({ created_by: true }).partial();

/* * */

export type VerificationToken = z.infer<typeof VerificationTokenSchema>;
export type CreateVerificationTokenDto = z.infer<typeof CreateVerificationTokenSchema>;
export type UpdateVerificationTokenDto = z.infer<typeof UpdateVerificationTokenSchema>;
