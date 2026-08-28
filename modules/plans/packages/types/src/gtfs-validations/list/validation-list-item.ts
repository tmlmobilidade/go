/* * */

import { GtfsValidationSchema } from '@tmlmobilidade/go-types-operation';
import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const ValidationListItemSchema = GtfsValidationSchema
	.pick({
		_id: true,
		agency_id: true,
		file_id: true,
		gtfs_agency: true,
		gtfs_feed_info: true,
		processing_status: true,
		summary: true,
		updated_at: true,
		validity_status: true,
	})
	.extend({
		created_at: UnixTimestampSchema,
	});

/**
 * A read model combining the canonical validation data with derived
 * data, including created at.
 * It is intended for use in the validation list.
 */
export type ValidationListItem = z.infer<typeof ValidationListItemSchema>;
