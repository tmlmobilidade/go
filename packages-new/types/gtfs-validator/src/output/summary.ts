/* * */

import { GtfsValidationOutputMessageSchema } from '@/output/message.js';
import { GtfsValidationOutputTranslationSchema } from '@/output/translation.js';
import { SeverityStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsValidationOutputResultSchema = z.object({
	description: z.string(),
	description_translation: GtfsValidationOutputTranslationSchema.optional(),
	messages: z.array(GtfsValidationOutputMessageSchema),
	rule_id: z.string(),
	severity: SeverityStatusSchema,
	total_rows: z.int().nonnegative(),
});

export type GtfsValidationOutputResult = z.infer<typeof GtfsValidationOutputResultSchema>;

export const GtfsValidationOutputSummarySchema = z.object({
	results: z.array(GtfsValidationOutputResultSchema),
	totals: z.object({
		errors: z.int().nonnegative(),
		infos: z.int().nonnegative(),
		warnings: z.int().nonnegative(),
	}),
});

export type GtfsValidationOutputSummary = z.infer<typeof GtfsValidationOutputSummarySchema>;
