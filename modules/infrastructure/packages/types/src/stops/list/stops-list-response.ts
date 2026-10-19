/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

/* * */

export const StopsListResponseSchema = StopSchema.pick({
	_id: true,
	is_deleted: true,
	latitude: true,
	legacy_ids: true,
	lifecycle_status: true,
	location: true,
	longitude: true,
	name: true,
});

/**
 * A read model for the stops list response.
 * It is intended for use in the infrastructure module.
 */
export type StopsListResponse = z.infer<typeof StopsListResponseSchema>;
