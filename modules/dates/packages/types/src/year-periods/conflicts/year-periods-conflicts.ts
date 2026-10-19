/* * */

import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const YearPeriodsConflictsRequestSchema = z.object({
	agency_ids: z.array(z.string()),
	dates: z.array(OperationalDateSchema),
	year_period_id: z.string().optional(),
});

export const YearPeriodsConflictsResponseSchema = z.object({
	conflicts: z.array(z.object({
		dates: z.array(OperationalDateSchema),
		year_period: YearPeriodSchema,
	})),
});

export type YearPeriodsConflictsRequest = z.infer<typeof YearPeriodsConflictsRequestSchema>;
export type YearPeriodsConflictsResponse = z.infer<typeof YearPeriodsConflictsResponseSchema>;
