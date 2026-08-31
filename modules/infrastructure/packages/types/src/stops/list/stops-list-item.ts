/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { TemporalStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopsListItemSchema = StopSchema.pick({
	_id: true,
	latitude: true,
	longitude: true,
	name: true,
});

/**
 * A read model combining the canonical plan data with derived data.
 * It is intended for use in the plans module.
 */
export type StopsListItem = z.infer<typeof StopsListItemSchema>;
