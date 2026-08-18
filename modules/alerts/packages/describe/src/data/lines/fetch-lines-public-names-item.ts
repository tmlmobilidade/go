/* * */

import { z } from 'zod';

/* * */

export const FetchLinesPublicNamesItemSchema = z.object({
	route_long_name: z.string(),
	route_short_name: z.string(),
});

/**
 * A item model for the lines public names query.
 */
export type FetchLinesPublicNamesItem = z.infer<typeof FetchLinesPublicNamesItemSchema>;
