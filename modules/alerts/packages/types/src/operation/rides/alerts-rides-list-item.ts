/* * */

import { RideSchema } from '@tmlmobilidade/go-types-operation';
import { DelayStatusSchema, OperationalStatusSchema, SeenStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const AlertsRidesListItemSchema = RideSchema
	.pick({
		_id: true,
		agency_id: true,
		headsign: true,
		operational_date: true,
		seen_last_at: true,
		shape_id: true,
		start_time_observed: true,
		start_time_scheduled: true,
	})
	.extend({
		operational_status: OperationalStatusSchema,
		seen_status: SeenStatusSchema,
		start_delay_status: DelayStatusSchema.nullable().default(null),
	});

/**
 * A read model combining the canonical ride data with derived statuses.
 * It is intended for use in the alerts module.
 */
export type AlertsRidesListItem = z.infer<typeof AlertsRidesListItemSchema>;
