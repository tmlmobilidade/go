/* * */

import { z } from 'zod';

/* * */

export const AlertReferencesSchema = z.array(z.object({
	child_ids: z.array(z.string()),
	parent_id: z.string(),
})).default([]);

export type AlertReferences = z.infer<typeof AlertReferencesSchema>;
