/* * */

import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubScheduledArrivalSchema = z.object({
	arrival_time: z.string(),
	arrival_time_24h: z.string(),
	stop_id: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
});

/**
 * Scheduled arrival data for the Hub Network API.
 */
export type HubScheduledArrival = z.infer<typeof HubScheduledArrivalSchema>;
