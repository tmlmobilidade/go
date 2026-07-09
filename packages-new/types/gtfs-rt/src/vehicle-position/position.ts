/* * */

import { z } from 'zod';

/* * */

export const GtfsRtPositionSchema = z.object({
	bearing: z.number().nullish(),
	latitude: z.number(),
	longitude: z.number(),
	odometer: z.number().nullish(),
	speed: z.number().nullish(),
});

export type GtfsRtPosition = z.infer<typeof GtfsRtPositionSchema>;
