/* * */

import { z } from 'zod';

/* * */

export const StopFlagSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
	is_harmonized: z.boolean().default(false),
	short_name: z.string(),
	stop_id: z.string(),
});

export type StopFlag = z.infer<typeof StopFlagSchema>;
