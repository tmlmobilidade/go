/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

/* * */

export const PatternsStopSearchItemSchema = StopSchema.pick({
	_id: true,
	name: true,
});

export const PatternsStopSearchQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(25).default(25),
	query: z.string().trim().min(2).max(100),
});

export type PatternsStopSearchItem = z.infer<typeof PatternsStopSearchItemSchema>;
export type PatternsStopSearchQuery = z.infer<typeof PatternsStopSearchQuerySchema>;
