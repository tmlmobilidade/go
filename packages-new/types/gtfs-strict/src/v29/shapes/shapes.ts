/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { NonNegativeFloatSchema, NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV29ShapesSchema = z.object({
	shape_dist_traveled: NonNegativeFloatSchema,
	shape_id: z.string(),
	shape_pt_lat: LatitudeSchema,
	shape_pt_lon: LongitudeSchema,
	shape_pt_sequence: NonNegativeIntegerSchema,
});

/**
 * Represents a shape in the GTFS format.
 * A shape is a series of points that define the path of a route.
 * It includes information such as the shape ID, the distance traveled,
 * and the latitude and longitude of the points.
 */
export type GtfsStrictV29Shapes = z.infer<typeof GtfsStrictV29ShapesSchema>;
