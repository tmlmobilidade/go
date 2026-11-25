/* * */

import { z } from 'zod';

/* * */

export const StopTimesExtSchema = z.object({
	billboard_alignment_id: z.string(),
	billboard_importance: z.string(),
	index: z.string(),
	note: z.string(),
	route_stop_sequence: z.number(),
	stop_id: z.string(),
	stop_sequence: z.number(),
	trip_id: z.string(),
});

export type StopTimesExt = z.output<typeof StopTimesExtSchema>;
