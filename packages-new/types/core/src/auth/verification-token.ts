/* * */

import { DocumentSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const VerificationTokenSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		expires_at: UnixTimestampSchema,
		token: z.string(),
		user_id: z.string(),
	});

export const CreateVerificationTokenSchema = VerificationTokenSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateVerificationTokenSchema = CreateVerificationTokenSchema.partial();

/* * */

export type VerificationToken = z.infer<typeof VerificationTokenSchema>;
export type CreateVerificationTokenDto = z.infer<typeof CreateVerificationTokenSchema>;
export type UpdateVerificationTokenDto = z.infer<typeof UpdateVerificationTokenSchema>;
