/* * */

import { PlanSchema } from '@tmlmobilidade/go-types-operation';
import { ValidityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlanListItemSchema = PlanSchema
	.pick({
		_id: true,
		agency_id: true,
		apps: true,
		gtfs_agency: true,
		gtfs_feed_info: true,
	})
	.extend({
		validity_status: ValidityStatusSchema,
	});

/**
 * A read model combining the canonical plan data with derived
 * data, including validity status.
 * It is intended for use in the plans module.
 */
export type PlanListItem = z.infer<typeof PlanListItemSchema>;
