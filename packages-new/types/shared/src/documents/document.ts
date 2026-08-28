/* * */

import { UnixMillisecondsSchema } from '@/datetime/unix-millis.js';
import { z } from 'zod';

/* * */

export const BaseDocumentSchema = z.object({
	_id: z.string(),
	created_at: UnixMillisecondsSchema,
	created_by: z.string().nullable().default(null),
	is_locked: z.boolean().default(false),
	updated_at: UnixMillisecondsSchema,
	updated_by: z.string().optional(),
});

export type BaseDocument = z.infer<typeof BaseDocumentSchema>;
