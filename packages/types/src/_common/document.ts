/* * */

import { UnixTimestampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const DocumentSchema = z.object({
	_id: z.string(),
	created_at: UnixTimestampSchema,
	created_by: z.string().nullable().default(null),
	is_locked: z.boolean().default(false),
	updated_at: UnixTimestampSchema,
	updated_by: z.string().optional(),
});
