/* * */

import { BaseDocumentSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const VerificationTokenSchema = BaseDocumentSchema
	.pick({ _id: true, created_at: true, updated_at: true })
	.extend({
		expires_at: UnixMillisecondsSchema,
		token: z.string(),
		user_id: z.string(),
	});

export const CreateVerificationTokenSchema = VerificationTokenSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateVerificationTokenSchema = CreateVerificationTokenSchema.partial();

/* * */

export type VerificationToken = z.infer<typeof VerificationTokenSchema>;
export type CreateVerificationTokenDto = z.infer<typeof CreateVerificationTokenSchema>;
export type UpdateVerificationTokenDto = z.infer<typeof UpdateVerificationTokenSchema>;
