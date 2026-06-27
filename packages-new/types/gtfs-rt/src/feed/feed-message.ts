/* * */

import { GtfsRtFeedEntitySchema } from '@/feed/feed-entity.js';
import { GtfsRtFeedHeaderSchema } from '@/feed/feed-header.js';
import { z } from 'zod';

/* * */

export const GtfsRtFeedMessageSchema = z.object({
	entity: z.array(GtfsRtFeedEntitySchema),
	header: GtfsRtFeedHeaderSchema,
});

export type GtfsRtFeedMessage = z.infer<typeof GtfsRtFeedMessageSchema>;
