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

/**
 * Represents a shape in the GTFS format.
 * A shape is a series of points that define the path of a route.
 * It includes information such as the shape ID, the distance traveled,
 * and the latitude and longitude of the points.
 */
export type GtfsShape = z.infer<typeof GtfsShapeSchema>;
