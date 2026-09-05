/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { HubV1ApiScheduledArrivalSchema } from './scheduled-arrival.js';

/* * */

export const HubV1ApiPatternTripSchema = z.object({
	schedule: z.array(HubV1ApiScheduledArrivalSchema),
	service_ids: z.array(z.string()),
	trip_ids: z.array(z.string()),
	valid_on: z.array(OperationalDateIntSchema),
	version_id: z.string(),
});

/**
 * Pattern trip data for the Hub V1 Patterns API.
 */
export type HubV1ApiPatternTrip = z.infer<typeof HubV1ApiPatternTripSchema>;
