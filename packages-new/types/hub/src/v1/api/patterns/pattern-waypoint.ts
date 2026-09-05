/* * */

import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiPatternWaypointSchema = z.object({
	allow_drop_off: z.boolean(),
	allow_pickup: z.boolean(),
	distance: NonNegativeIntegerSchema,
	distance_delta: NonNegativeIntegerSchema,
	stop_id: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
});

/**
 * Pattern waypoint data for the Hub V1 Patterns API.
 */
export type HubV1ApiPatternWaypoint = z.infer<typeof HubV1ApiPatternWaypointSchema>;
