/* * */

import { z } from 'zod';

/* * */

export const FetchLinesReferenceContextItemSchema = z.object({
	route_long_name: z.string(),
	route_short_name: z.string(),
});

/**
 * A item model for the lines public names query.
 */
export type FetchLinesReferenceContextItem = z.infer<typeof FetchLinesReferenceContextItemSchema>;
