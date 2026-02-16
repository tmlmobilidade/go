/* * */

import { GtfsRtFeedEntitySchema } from '@/gtfs-rt/feed-entity.js';
import { GtfsRtFeedHeaderSchema } from '@/gtfs-rt/feed-header.js';
import { z } from 'zod';

/* * */

export const GtfsRtFeedMessageSchema = z.object({
	entity: z.array(GtfsRtFeedEntitySchema),
	header: GtfsRtFeedHeaderSchema,
});

export type GtfsRtFeedMessage = z.infer<typeof GtfsRtFeedMessageSchema>;
