/* * */

import { GtfsAgencySchema, GtfsFeedInfoSchema } from '@tmlmobilidade/go-types-gtfs';
import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubPlanSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	created_at: UnixMillisecondsSchema,
	gtfs_agency: GtfsAgencySchema,
	gtfs_feed_info: GtfsFeedInfoSchema,
	hash: z.string(),
	is_active: z.boolean().default(false),
	operation_file_id: z.string(),
	operation_file_url: z.string().url(),
	updated_at: UnixMillisecondsSchema,
});

/**
 * Plan data for the Hub Plans API.
 */
export type HubPlan = z.infer<typeof HubPlanSchema>;

