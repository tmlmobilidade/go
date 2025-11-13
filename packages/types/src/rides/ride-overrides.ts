/* * */

import { z } from 'zod';

/* * */

export const RideOverridesSchema = z.object({
	trip_id: z.string().nullable().default(null),
}).strict();

export type RideOverrides = z.infer<typeof RideOverridesSchema>;
