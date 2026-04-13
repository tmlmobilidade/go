/* * */

import { z } from 'zod';

/* * */

export const StopLegacyIdSchema = z.object({
	agency_id: z.string(),
	is_merged: z.boolean().default(false),
	legacy_id: z.string().nullable().default(null),
});

export type StopLegacyId = z.infer<typeof StopLegacyIdSchema>;
