/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { PathSchema, ResolvedPatternSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

export const PatternsDetailPathItemSchema = PathSchema.extend({
	stop: StopSchema.nullable(),
});

export const PatternsDetailSchema = ResolvedPatternSchema.extend({
	path: z.array(PatternsDetailPathItemSchema),
});

export type PatternsDetailPathItem = z.infer<typeof PatternsDetailPathItemSchema>;
export type PatternsDetail = z.infer<typeof PatternsDetailSchema>;
