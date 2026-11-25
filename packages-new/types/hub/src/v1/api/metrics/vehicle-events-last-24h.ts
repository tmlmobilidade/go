/* * */

import { NonNegativeIntegerSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiVehicleEventsLast24hSchema = z.object({
	count: NonNegativeIntegerSchema,
	from: UnixMillisecondsSchema,
	to: UnixMillisecondsSchema,
});

/**
 * Count of vehicle events received in the last 24 hours, for the Hub V1 Metrics API.
 */
export type HubV1ApiVehicleEventsLast24h = z.infer<typeof HubV1ApiVehicleEventsLast24hSchema>;
