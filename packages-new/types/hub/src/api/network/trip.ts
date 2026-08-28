/* * */

import { HubScheduledArrivalSchema } from '@/api/network/scheduled-arrival.js';
import { z } from 'zod';

/* * */

export const HubTripSchema = z.object({
	schedule: z.array(HubScheduledArrivalSchema),
	service_ids: z.array(z.string()),
	trip_ids: z.array(z.string()),
	valid_on: z.array(z.string()),
	version_id: z.string(),
});

/**
 * Publishable trip data for the Hub Network API.
 */
export type HubTrip = z.infer<typeof HubTripSchema>;
