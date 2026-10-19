/* * */

import { z } from 'zod';

import { StopsListResponseSchema } from './stops-list-response.js';

/* * */

export const StopsListItemSchema = StopsListResponseSchema.extend({
	neighbourhood_name: z.string().nullable(),
	primary_location_name: z.string(),
	secondary_location_name: z.string(),
	tertiary_location_name: z.string(),
});

/**
 * A read model for the stops list item.
 * It is intended for use in the infrastructure module.
 */
export type StopsListItem = z.infer<typeof StopsListItemSchema>;
