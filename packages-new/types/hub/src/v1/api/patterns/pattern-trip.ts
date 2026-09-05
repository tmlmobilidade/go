/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { HubScheduledArrivalSchema } from './scheduled-arrival.js';

/* * */

export const HubPatternTripSchema = z.object({
	schedule: z.array(HubScheduledArrivalSchema),
	service_ids: z.array(z.string()),
	trip_ids: z.array(z.string()),
	valid_on: z.array(OperationalDateIntSchema),
	version_id: z.string(),
});

/**
 * Pattern trip data for the Hub Network API.
 */
export type HubPatternTrip = z.infer<typeof HubPatternTripSchema>;
