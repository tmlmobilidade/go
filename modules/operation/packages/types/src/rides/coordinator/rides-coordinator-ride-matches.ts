/* * */

import { z } from 'zod';

/* * */

export const RidesCoordinatorRideMatchesResponseSchema = z.object({
	ids: z.array(z.string()),
});

/**
 * The response schema for getting ride match IDs.
 * It is intended for use in the rides module.
 */
export type RidesCoordinatorRideMatchesResponse = z.infer<typeof RidesCoordinatorRideMatchesResponseSchema>;
