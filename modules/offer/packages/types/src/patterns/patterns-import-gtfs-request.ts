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
}).superRefine((value, context) => {
	const path = value.path.slice().sort((left, right) => left.stop_sequence - right.stop_sequence);
	const shape = value.shape.slice().sort((left, right) => left.shape_pt_sequence - right.shape_pt_sequence);
	if (new Set(path.map(item => item.stop_sequence)).size !== path.length) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'Stop sequences must be unique.', path: ['path'] });
	}
	if (new Set(shape.map(item => item.shape_pt_sequence)).size !== shape.length) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'Shape point sequences must be unique.', path: ['shape'] });
	}
	if (path.some((item, index) => index > 0 && item.shape_dist_traveled < path[index - 1].shape_dist_traveled)) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'Stop distances must not decrease along the path.', path: ['path'] });
	}
	if (shape.some((item, index) => index > 0 && item.shape_dist_traveled < shape[index - 1].shape_dist_traveled)) {
		context.addIssue({ code: z.ZodIssueCode.custom, message: 'Shape distances must not decrease along the path.', path: ['shape'] });
	}
});

export type PatternsImportGtfsRequest = z.infer<typeof PatternsImportGtfsRequestSchema>;
