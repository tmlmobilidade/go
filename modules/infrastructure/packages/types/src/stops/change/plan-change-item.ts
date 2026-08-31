/* * */

import { GtfsValidationSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const PlanChangeItemSchema = z.object({
	validation_id: GtfsValidationSchema.shape._id,
});

export type PlanChangeItem = z.infer<typeof PlanChangeItemSchema>;
