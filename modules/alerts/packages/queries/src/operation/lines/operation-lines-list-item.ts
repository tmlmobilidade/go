/* * */

import { z } from 'zod';

/* * */

export const OperationLinesListItemSchema = z.object({
	routes: z.array(z.object({
		route_long_name: z.string(),
		route_shape_id: z.string(),
		route_short_name: z.string(),
	})),
	stop_id: z.string(),
	stop_lat: z.number(),
	stop_lon: z.number(),
	stop_name: z.string(),
});

/**
 * A read model combining the canonical stop data with derived data, including routes.
 * It is intended for use in the alerts module.
 */
export type OperationLinesListItem = z.infer<typeof OperationLinesListItemSchema>;
