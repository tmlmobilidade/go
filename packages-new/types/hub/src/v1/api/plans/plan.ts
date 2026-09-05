/* * */

import { OperationalDateIntSchema, UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiPlanSchema = z.object({
	_id: z.string(),
	active_from: OperationalDateIntSchema,
	active_until: OperationalDateIntSchema,
	agency_code: z.string(),
	agency_id: z.string(),
	agency_name: z.string(),
	created_at: UnixMillisecondsSchema,
	hash: z.string(),
	is_active: z.boolean().default(false),
	operation_file_id: z.string(),
	operation_file_url: z.string().url(),
	updated_at: UnixMillisecondsSchema,
});

/**
 * Plan data for the Hub V1 Plans API.
 */
export type HubV1ApiPlan = z.infer<typeof HubV1ApiPlanSchema>;

