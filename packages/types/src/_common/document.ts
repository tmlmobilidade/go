/* * */

import { UnixTimeStampSchema } from '@/_common/unix-timestamp.js';
import { z } from 'zod';

/* * */

export const DocumentSchema = z.object({
	_id: z.string(),
	created_at: UnixTimeStampSchema,
	created_by: z.string().optional(),
	is_locked: z.boolean().default(false),
	updated_at: UnixTimeStampSchema,
	updated_by: z.string().optional(),
});
