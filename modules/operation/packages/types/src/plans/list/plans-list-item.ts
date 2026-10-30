/* * */

import { PlanSchema } from '@tmlmobilidade/go-types-operation';
import { TemporalStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const PlansListItemSchema = PlanSchema.extend({
	has_overlapping_plans: z.boolean(),
	temporal_status: TemporalStatusSchema,
});

/**
 * A read model combining the canonical plan data with derived data.
 * It is intended for use in the plans module.
 */
export type PlansListItem = z.infer<typeof PlansListItemSchema>;
