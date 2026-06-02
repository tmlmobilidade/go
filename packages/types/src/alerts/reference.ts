/* * */

import { z } from 'zod';

/* * */

export const AlertReferenceSchema = z.object({
	child_ids: z.array(z.string()),
	parent_id: z.string(),
});

export type AlertReference = z.infer<typeof AlertReferenceSchema>;
