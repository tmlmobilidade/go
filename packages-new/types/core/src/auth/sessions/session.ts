/* * */

import { BaseDocumentSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SessionSchema = BaseDocumentSchema
	.pick({ _id: true, created_at: true, updated_at: true })
	.extend({
		expires_at: UnixMillisecondsSchema,
		token: z.string(),
		user_id: z.string(),
	});

export const CreateSessionSchema = SessionSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateSessionSchema = CreateSessionSchema.partial();

export type Session = z.infer<typeof SessionSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
