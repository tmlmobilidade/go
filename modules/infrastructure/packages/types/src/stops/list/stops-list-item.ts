/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

/* * */

export const StopsListItemSchema = StopSchema
	.pick({
		_id: true,
		district_id: true,
		is_deleted: true,
		latitude: true,
		legacy_ids: true,
		lifecycle_status: true,
		locality_id: true,
		longitude: true,
		municipality_id: true,
		name: true,
		parish_id: true,
	})
	.extend({
		district_name: z.string(),
		locality_name: z.string(),
		municipality_name: z.string(),
		parish_name: z.string(),
	});

/**
 * A read model combining the canonical stop data with derived data.
 * It is intended for use in the infrastructure module.
 */
export type StopsListItem = z.infer<typeof StopsListItemSchema>;
