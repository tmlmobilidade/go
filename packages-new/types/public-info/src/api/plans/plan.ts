/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/types';
import { GtfsAgencySchema } from '@tmlmobilidade/types';
import { GtfsFeedInfoSchema } from '@tmlmobilidade/types';
import { z } from 'zod';

/* * */

export const HubPlanSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixTimestampSchema,
	gtfs_agency: GtfsAgencySchema,
	gtfs_feed_info: GtfsFeedInfoSchema,
	hash: z.string(),
	is_active: z.boolean().default(false),
	operation_file_id: z.string(),
	operation_file_url: z.string(),
	updated_at: UnixTimestampSchema,
});

/**
 * Publishable plan data for the Hub Plans API.
 */
export type HubPlan = z.infer<typeof HubPlanSchema>;

