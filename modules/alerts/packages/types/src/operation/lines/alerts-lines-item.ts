/* * */

import { z } from 'zod';

/* * */

export const AlertsLinesItemSchema = z.object({
	agency_id: z.string(),
	patterns: z.array(z.object({
		headsign: z.string(),
		route_id: z.string(),
		shape_id: z.string(),
		stops: z.array(z.object({
			stop_id: z.string(),
			stop_name: z.string(),
		})),
	})),
	route_long_name: z.string(),
	route_short_name: z.string(),
});

/**
 * A read model combining the canonical lines data with derived data, including routes.
 * It is intended for use in the alerts module.
 */
export type AlertsLinesItem = z.infer<typeof AlertsLinesItemSchema>;
