/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/**
 * @deprecated Use the `HashedTrip` type from the `@tmlmobilidade/go-types-operation` package instead.
 */
export const HashedPatternWaypointSchema = z.object({
	drop_off_type: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
	pickup_type: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
	shape_dist_traveled: z.number(),
	stop_id: z.string(),
	stop_lat: z.number(),
	stop_lon: z.number(),
	stop_name: z.string(),
	stop_sequence: z.number(),
	timepoint: z.number(),
});

/**
 * @deprecated Use the `HashedTrip` type from the `@tmlmobilidade/go-types-operation` package instead.
 */
export type HashedPatternWaypoint = z.infer<typeof HashedPatternWaypointSchema>;

/**
 * @deprecated Use the `HashedTrip` type from the `@tmlmobilidade/go-types-operation` package instead.
 */
export const HashedPatternSchema = DocumentSchema
	.omit({ created_by: true, is_locked: true, updated_by: true })
	.extend({
		agency_id: z.string(),
		line_id: z.number(),
		line_long_name: z.string(),
		line_short_name: z.string(),
		path: z.array(HashedPatternWaypointSchema).default([]),
		pattern_id: z.string(),
		route_color: z.string(),
		route_id: z.string(),
		route_long_name: z.string(),
		route_short_name: z.string(),
		route_text_color: z.string(),
		trip_headsign: z.string(),
	});

/**
 * @deprecated Use the `HashedTrip` type from the `@tmlmobilidade/go-types-operation` package instead.
 */
export type HashedPattern = z.infer<typeof HashedPatternSchema>;
