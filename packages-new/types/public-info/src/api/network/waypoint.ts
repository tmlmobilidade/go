/* * */

import { z } from 'zod';

/* * */

export const HubWaypointSchema = z.object({
	allow_drop_off: z.boolean(),
	allow_pickup: z.boolean(),
	distance: z.number(),
	distance_delta: z.number(),
	stop_id: z.string(),
	stop_sequence: z.number(),
});

/**
 * Publishable waypoint data for the Hub Network API.
 */
export type HubWaypoint = z.infer<typeof HubWaypointSchema>;
