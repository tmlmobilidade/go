/* * */

import { GtfsValidationSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const ValidationCreateItemSchema = GtfsValidationSchema.pick({
	gtfs_agency: true,
	gtfs_feed_info: true,
});

export type ValidationCreateItem = z.infer<typeof ValidationCreateItemSchema>;
