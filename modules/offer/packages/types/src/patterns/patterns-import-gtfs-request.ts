/* * */

import { z } from 'zod';

/* * */

export const PatternsImportGtfsRequestSchema = z.object({
	path: z.array(z.object({
		avg_speed: z.number().finite().nonnegative(),
		dwell_time: z.number().finite().nonnegative(),
		shape_dist_traveled: z.number().finite().nonnegative(),
		stop_id: z.string().trim().min(1),
		stop_sequence: z.number().int().nonnegative(),
	})).min(1),
	shape: z.array(z.object({
		shape_dist_traveled: z.number().finite().nonnegative(),
		shape_pt_lat: z.number().finite().min(-90).max(90),
		shape_pt_lon: z.number().finite().min(-180).max(180),
		shape_pt_sequence: z.number().int().nonnegative(),
	})).min(2),
});

export type PatternsImportGtfsRequest = z.infer<typeof PatternsImportGtfsRequestSchema>;
