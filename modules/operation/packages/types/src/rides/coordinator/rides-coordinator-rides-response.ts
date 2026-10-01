/* * */

import { z } from 'zod';

/* * */

export const RidesCoordinatorRidesResponseSchema = z.object({
	ride_ids: z.array(z.string()),
});

/**
 * The response schema for getting ride IDs.
 * It is intended for use in the rides module.
 */
export type RidesCoordinatorRidesResponse = z.infer<typeof RidesCoordinatorRidesResponseSchema>;
