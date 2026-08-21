/* * */

import { AlertSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const AlertsListItemSchema = AlertSchema.pick({
	_id: true,
	active_period_end_date: true,
	active_period_start_date: true,
	agency_id: true,
	cause: true,
	created_at: true,
	created_by: true,
	effect: true,
	publish_end_date: true,
	publish_start_date: true,
	publish_status: true,
	reference_type: true,
	title: true,
	updated_at: true,
	updated_by: true,
});

/* * */

/**
 * A read model for the alert list item.
 */
export type AlertsListItem = z.infer<typeof AlertsListItemSchema>;
