/* * */

import { z } from 'zod';

/* * */

export const StopFlagSchema = z.object({
	agency_id: z.string(),
	is_merged: z.boolean().default(false),
	legacy_id: z.string().nullable().default(null),
});

export type StopFlag = z.infer<typeof StopFlagSchema>;
