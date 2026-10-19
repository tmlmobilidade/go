/* * */

import { z } from 'zod';

/* * */

export const RideOverridesSchema = z.object({
	trip_id: z.string().nullable().default(null),
});

export type RideOverrides = z.infer<typeof RideOverridesSchema>;
