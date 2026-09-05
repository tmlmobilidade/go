/* * */

import { HubScheduledArrivalSchema } from '@/api/arrivals/scheduled-arrival.js';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubTripSchema = z.object({
	schedule: z.array(HubScheduledArrivalSchema),
	service_ids: z.array(z.string()),
	trip_ids: z.array(z.string()),
	valid_on: z.array(OperationalDateIntSchema),
	version_id: z.string(),
});

/**
 * Trip data for the Hub Network API.
 */
export type HubTrip = z.infer<typeof HubTripSchema>;
