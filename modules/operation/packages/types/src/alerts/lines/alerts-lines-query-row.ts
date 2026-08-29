/* * */

import { z } from 'zod';

/* * */

export const AlertsLinesQueryRowSchema = z.object({
	agency_id: z.string(),
	patterns: z.array(
		z.tuple([
			z.string(), // headsign
			z.string(), // route_id
			z.string(), // shape_id
			z.array( // stops array
				z.tuple([
					z.string(), // stop_id
					z.string(), // stop_name
				]),
			),
		]),
	),
	route_long_name: z.string(),
	route_short_name: z.string(),
});

/**
 * The shape of the row returned by the alerts_lines_query query,
 * where the patterns and pattern.stops are tuples.
 */
export type AlertsLinesQueryRow = z.infer<typeof AlertsLinesQueryRowSchema>;
