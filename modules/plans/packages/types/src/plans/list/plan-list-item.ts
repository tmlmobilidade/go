/* * */

import { PlanSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const PlanListItemSchema = PlanSchema.pick({
	_id: true,
	agency_id: true,
	apps: true,
	created_at: true,
	created_by: true,
	gtfs_feed_info: true,
	operation_file_id: true,
	updated_at: true,
	updated_by: true,
});

/**
 * A read model combining the canonical plan data with derived data.
 * It is intended for use in the plans module.
 */
export type PlanListItem = z.infer<typeof PlanListItemSchema>;
