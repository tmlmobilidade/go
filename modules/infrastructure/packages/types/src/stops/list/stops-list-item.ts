/* * */

import { z } from 'zod';

import { StopsListResponseSchema } from './stops-list-response.js';

/* * */

export const StopsListItemSchema = StopsListResponseSchema.extend({
	district_name: z.string(),
	locality_name: z.string(),
	municipality_name: z.string(),
	parish_name: z.string(),
});

/**
 * A read model for the stops list item.
 * It is intended for use in the infrastructure module.
 */
export type StopsListItem = z.infer<typeof StopsListItemSchema>;
