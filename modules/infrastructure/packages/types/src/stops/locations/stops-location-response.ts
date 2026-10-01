/* * */

import { LocationItemSchema } from '@tmlmobilidade/go-types-locations';
import { z } from 'zod';

/* * */

export const StopsLocationResponseSchema = z.object({
	neighbourhood: z.array(LocationItemSchema),
	primary: z.array(LocationItemSchema),
	secondary: z.array(LocationItemSchema),
	tertiary: z.array(LocationItemSchema),
});

/**
 * The response schema for listing stops locations: for each slot, the divisions
 * that have at least one stop the user can access. Intended for stop filters.
 */
export type StopsLocationResponse = z.infer<typeof StopsLocationResponseSchema>;
