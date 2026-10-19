/* * */

import { z } from 'zod';

import { GtfsRtFeedEntitySchema } from './feed-entity.js';
import { GtfsRtFeedHeaderSchema } from './feed-header.js';

/* * */

export const GtfsRtFeedMessageSchema = z.object({
	entity: z.array(GtfsRtFeedEntitySchema),
	header: GtfsRtFeedHeaderSchema,
});

export type GtfsRtFeedMessage = z.infer<typeof GtfsRtFeedMessageSchema>;
