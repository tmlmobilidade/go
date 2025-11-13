/* * */

import { DocumentSchema } from '@/_common/document.js';
import { unixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const VerificationTokenSchema = DocumentSchema.extend({
	expires_at: unixTimeStampSchema,
	token: z.string(),
	user_id: z.string(),
}).strict();

export const CreateVerificationTokenSchema = VerificationTokenSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateVerificationTokenSchema = CreateVerificationTokenSchema.omit({ created_by: true }).partial();

/* * */

export type VerificationToken = z.infer<typeof VerificationTokenSchema>;
export type CreateVerificationTokenDto = z.infer<typeof CreateVerificationTokenSchema>;
export type UpdateVerificationTokenDto = z.infer<typeof UpdateVerificationTokenSchema>;
