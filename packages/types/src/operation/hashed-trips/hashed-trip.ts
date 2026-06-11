/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HashedTripWaypointSchema = z.object({
	arrival_time: z.string(),
	departure_time: z.string(),
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

export type HashedTripWaypoint = z.infer<typeof HashedTripWaypointSchema>;

/* * */

export const HashedTripSchema = DocumentSchema
	.omit({ created_by: true, is_locked: true, updated_by: true })
	.extend({
		agency_id: z.string(),
		line_id: z.number(),
		line_long_name: z.string(),
		line_short_name: z.string(),
		path: z.array(HashedTripWaypointSchema).default([]),
		pattern_id: z.string(),
		route_color: z.string(),
		route_id: z.string(),
		route_long_name: z.string(),
		route_short_name: z.string(),
		route_text_color: z.string(),
		trip_headsign: z.string(),
	});

export type HashedTrip = z.infer<typeof HashedTripSchema>;
