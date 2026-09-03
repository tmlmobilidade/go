/* * */

import { RideSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const FetchRidesReferenceContextItemSchema = RideSchema.pick({
	headsign: true,
	route_short_name: true,
	start_time_scheduled: true,
});

/**
 * A item model for the rides public names query.
 */
export type FetchRidesReferenceContextItem = z.infer<typeof FetchRidesReferenceContextItemSchema>;
