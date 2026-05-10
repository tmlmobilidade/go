/* * */

import { DocumentSchema } from '@/_common/document.js';
import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const SessionSchema = DocumentSchema
	.omit({ is_locked: true })
	.extend({
		expires_at: UnixTimestampSchema,
		token: z.string(),
		user_id: z.string(),
	});

export const CreateSessionSchema = SessionSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateSessionSchema = CreateSessionSchema.omit({ created_by: true }).partial();

export type Session = z.infer<typeof SessionSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
