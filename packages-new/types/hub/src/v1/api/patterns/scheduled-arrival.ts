/* * */

import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiScheduledArrivalSchema = z.object({
	arrival_time: z.string(),
	arrival_time_24h: z.string(),
	stop_id: z.string(),
	stop_sequence: NonNegativeIntegerSchema,
});

/**
 * Scheduled arrival data for the Hub V1 Patterns API.
 */
export type HubV1ApiScheduledArrival = z.infer<typeof HubV1ApiScheduledArrivalSchema>;
