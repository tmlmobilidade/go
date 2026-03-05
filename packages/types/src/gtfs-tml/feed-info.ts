/* * */

import { GtfsFeedInfoSchema } from '@/gtfs/feed-info.js';
import { z } from 'zod';

/* * */

export const GtfsTMLFeedInfoSchema = GtfsFeedInfoSchema;
export type GtfsTMLFeedInfo = z.infer<typeof GtfsTMLFeedInfoSchema>;
