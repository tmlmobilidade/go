/* * */

import { z } from 'zod';

/* * */

export const PatternsImportGtfsRequestSchema = z.object({
	path: z.array(z.object({
		avg_speed: z.number(),
		dwell_time: z.number(),
		shape_dist_traveled: z.number(),
		stop_id: z.string(),
		stop_sequence: z.number(),
	})),
	shape: z.array(z.object({
		shape_dist_traveled: z.number(),
		shape_pt_lat: z.number(),
		shape_pt_lon: z.number(),
		shape_pt_sequence: z.number(),
	})),
});

export type PatternsImportGtfsRequest = z.infer<typeof PatternsImportGtfsRequestSchema>;
