/* * */

import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubPatternWaypointSchema = z.object({
	allow_drop_off: z.boolean(),
	allow_pickup: z.boolean(),
	distance: NonNegativeIntegerSchema,
	distance_delta: NonNegativeIntegerSchema,
	stop_id: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
});

/**
 * Pattern waypoint data for the Hub Network API.
 */
export type HubPatternWaypoint = z.infer<typeof HubPatternWaypointSchema>;
