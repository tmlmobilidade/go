/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1StopTimesExtSchema = z.object({
	billboard_alignment_id: z.string(),
	billboard_importance: z.string(),
	index: z.string(),
	note: z.string(),
	route_stop_sequence: z.number(),
	stop_id: z.string(),
	stop_sequence: z.number(),
	trip_id: z.string(),
});

export type OperationPostersV1StopTimesExt = z.output<typeof OperationPostersV1StopTimesExtSchema>;
