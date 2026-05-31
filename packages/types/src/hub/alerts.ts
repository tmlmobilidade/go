/* * */

import { AlertSchema } from '@/alerts/alert.js';
import { z } from 'zod';

/* * */

export const HubAlertSchema = AlertSchema.omit({
	auto_texts: true,
	created_at: true,
	created_by: true,
	external_id: true,
	file_id: true,
	is_locked: true,
	publish_end_date: true,
	publish_start_date: true,
	publish_status: true,
	updated_at: true,
	updated_by: true,
	user_instructions: true,
}).extend({
	image_url: z.string().nullable().default(null),
});

/**
 * Publishable alert data for the Hub Alerts API.
 */
export type HubAlert = z.infer<typeof HubAlertSchema>;

