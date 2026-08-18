/* * */

import { z } from 'zod';

/* * */

export const AlertsStopsQueryRowSchema = z.object({
	routes: z.array(
		z.tuple([
			z.string(), // route_long_name
			z.string(), // route_shape_id
			z.string(), // route_short_name
		]),
	),
	stop_id: z.string(),
	stop_lat: z.number(),
	stop_lon: z.number(),
	stop_name: z.string(),
});

/**
 * The shape of the row returned by the alerts_stops_query query,
 * where the routes are tuples.
 */
export type AlertsStopsQueryRow = z.infer<typeof AlertsStopsQueryRowSchema>;
