/* * */

import { z } from 'zod';

/* * */

export const FetchStopsPublicNamesItemSchema = z.object({
	stop_id: z.string(),
	stop_name: z.string(),
});

/**
 * A item model for the stops public names query.
 */
export type FetchStopsPublicNamesItem = z.infer<typeof FetchStopsPublicNamesItemSchema>;
