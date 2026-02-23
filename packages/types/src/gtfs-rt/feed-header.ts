/* * */

import { z } from 'zod';

/* * */

export const GtfsRtFeedHeaderSchema = z.object({
	feed_version: z.string().nullish(),
	gtfs_realtime_version: z.string(),
	incrementality: z.literal('FULL_DATASET'),
	timestamp: z.number(),
});

export type GtfsRtFeedHeader = z.infer<typeof GtfsRtFeedHeaderSchema>;
