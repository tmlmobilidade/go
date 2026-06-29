/* * */

import z from 'zod';

/* * */

export const ApiResponseSchema = z.object({
	geohash: z.string(),
	h3: z.string(),
	latitude: z.number(),
	longitude: z.number(),
});
