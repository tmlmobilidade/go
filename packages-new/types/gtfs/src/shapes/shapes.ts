/* * */

import { LatitudeSchema, LongitudeSchema, NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsShapeSchema = z.object({
	shape_dist_traveled: NonNegativeNumberSchema,
	shape_id: z.string(),
	shape_pt_lat: LatitudeSchema,
	shape_pt_lon: LongitudeSchema,
	shape_pt_sequence: NonNegativeNumberSchema,
});

export type GtfsShape = z.infer<typeof GtfsShapeSchema>;
