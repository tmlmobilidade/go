import z from 'zod';

/* * */

export const PositionSchema = z.object({
	geohash: z.string(),
	h3: z.string(),
	latitude: z.number(),
	longitude: z.number(),
});

export const ExtendedPositionSchema = z.object({
	geohash: z.object({
		geohash_2: z.string(),
		geohash_3: z.string(),
		geohash_4: z.string(),
		geohash_5: z.string(),
		geohash_6: z.string(),
		geohash_7: z.string(),
		geohash_8: z.string(),
		geohash_9: z.string(),
		//
		geohash_10: z.string(),
		geohash_11: z.string(),
		geohash_12: z.string(),
	}),
	h3: z.object({
		h3_1: z.string(),
		h3_2: z.string(),
		h3_3: z.string(),
		h3_4: z.string(),
		h3_5: z.string(),
		h3_6: z.string(),
		h3_7: z.string(),
		h3_8: z.string(),
		h3_9: z.string(),
		//
		h3_10: z.string(),
		h3_11: z.string(),
		h3_12: z.string(),
	}),
	latitude: z.number(),
	longitude: z.number(),
});

export type Position = z.infer<typeof PositionSchema>;
export type ExtendedPosition = z.infer<typeof ExtendedPositionSchema>;
