/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1ShapesExtSchema = z.object({
	shape_id: z.string(),
	shape_pt_lat: z.number(),
	shape_pt_lon: z.number(),
	shape_pt_sequence: z.number(),
});

export type OperationPostersV1ShapesExt = z.output<typeof OperationPostersV1ShapesExtSchema>;
