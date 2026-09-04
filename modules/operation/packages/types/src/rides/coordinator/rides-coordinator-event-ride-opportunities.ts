/* * */

import { z } from 'zod';

/* * */

export const RidesCoordinatorEventRideOpportunitiesResponseSchema = z.object({
	ids: z.array(z.string()),
});

/**
 * The response schema for getting event ride opportunity IDs.
 * It is intended for use in the rides module.
 */
export type RidesCoordinatorEventRideOpportunitiesResponse = z.infer<typeof RidesCoordinatorEventRideOpportunitiesResponseSchema>;
