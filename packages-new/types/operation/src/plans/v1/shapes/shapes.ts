/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1ShapesSchema = z.object({
	shape_dist_traveled: z.number().nonnegative(),
	shape_id: z.string(),
	shape_pt_lat: z.number().min(-90).max(90),
	shape_pt_lon: z.number().min(-180).max(180),
	shape_pt_sequence: z.number().int().nonnegative(),
});

export type OperationPostersV1Shapes = z.output<typeof OperationPostersV1ShapesSchema>;
