/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PassengerDemandDataStatusSchema } from './passenger-demand-by-dimensions-by-5-minutes.js';

/* * */

const IdListSchema = z.array(z.string().min(1)).min(1).max(200);

export const PassengerDemandBaselineComparisonQueryInputSchema = z.object({
	agency_ids: IdListSchema.optional(),
	data_statuses: z.array(PassengerDemandDataStatusSchema).min(1).max(2).optional(),
	exclude_unknown: z.boolean().optional(),
	line_ids: IdListSchema.optional(),
	operational_date: OperationalDateIntSchema,
	pattern_ids: IdListSchema.optional(),
	sample_size: z.number().int().min(1).max(8).optional(),
	stop_ids: IdListSchema.optional(),
});

const TypicalRangeSchema = z.object({
	lower: z.number().nonnegative(),
	median: z.number().nonnegative(),
	upper: z.number().nonnegative(),
});

export const PassengerDemandBaselineComparisonSchema = z.object({
	current: z.object({
		passenger_demand: z.number().int().nonnegative(),
	}),
	delta: z.object({
		passenger_demand: z.number().nullable(),
	}),
	meta: z.object({
		baseline_operational_dates: z.array(OperationalDateIntSchema),
		baseline_sample_size: z.number().int().nonnegative(),
		baseline_sample_target: z.number().int().positive(),
	}),
	typical: TypicalRangeSchema.nullable(),
});

export type PassengerDemandBaselineComparison = z.infer<typeof PassengerDemandBaselineComparisonSchema>;
export type PassengerDemandBaselineComparisonQueryInput = z.infer<typeof PassengerDemandBaselineComparisonQueryInputSchema>;

/* * */
