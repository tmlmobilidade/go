/* * */

import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const YearPeriodsConflictsRequestSchema = z.object({
	agency_ids: YearPeriodSchema.shape.agency_ids,
	dates: z.array(OperationalDateIntSchema),
	year_period_id: z.string().optional(),
});

export const YearPeriodsConflictsResponseSchema = z.object({
	conflicts: z.array(z.object({
		dates: z.array(OperationalDateIntSchema),
		year_period: YearPeriodSchema,
	})),
});

export type YearPeriodsConflictsRequest = z.infer<typeof YearPeriodsConflictsRequestSchema>;
export type YearPeriodsConflictsResponse = z.infer<typeof YearPeriodsConflictsResponseSchema>;
