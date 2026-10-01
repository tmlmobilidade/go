/* * */

import { PlanSchema } from '@tmlmobilidade/go-types-operation';
import { TemporalStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlansListItemSchema = PlanSchema.extend({
	temporal_status: TemporalStatusSchema,
});

/**
 * A read model combining the canonical plan data with derived data.
 * It is intended for use in the plans module.
 */
export type PlansListItem = z.infer<typeof PlansListItemSchema>;
