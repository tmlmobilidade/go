/* * */

import { z } from 'zod';

/* * */

export const HubScheduledArrivalSchema = z.object({
	arrival_time: z.string(),
	arrival_time_24h: z.string(),
	stop_id: z.string(),
	stop_sequence: z.number(),
});

/**
 * Publishable scheduled arrival data for the Hub Network API.
 */
export type HubScheduledArrival = z.infer<typeof HubScheduledArrivalSchema>;
