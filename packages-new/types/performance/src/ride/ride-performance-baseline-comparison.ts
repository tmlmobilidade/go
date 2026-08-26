/* * */

import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { RidePerformanceMetricsSchema } from './ride-performance-query.js';
import { RidePerformanceDataStatusSchema } from './ride-service-by-ride.js';

/* * */

const IdListSchema = z.array(z.string().min(1)).min(1).max(200);

export const RidePerformanceBaselineComparisonQueryInputSchema = z.object({
	agency_ids: IdListSchema.optional(),
	data_statuses: z.array(RidePerformanceDataStatusSchema).min(1).max(2).optional(),
	exclude_unknown: z.boolean().optional(),
	line_ids: IdListSchema.optional(),
	operational_date: OperationalDateIntSchema,
	pattern_ids: IdListSchema.optional(),
	sample_size: z.number().int().min(1).max(8).optional(),
});

const TypicalMetricRangeSchema = z.object({
	lower: z.number().nullable(),
	median: z.number().nullable(),
	upper: z.number().nullable(),
});

export const RidePerformanceBaselineComparisonSchema = z.object({
	current: RidePerformanceMetricsSchema,
	delta_pp: z.object({
		advances: z.number().nullable(),
		delays: z.number().nullable(),
		service: z.number().nullable(),
	}),
	meta: z.object({
		baseline_operational_dates: z.array(OperationalDateIntSchema),
		baseline_sample_size: z.number().int().nonnegative(),
		baseline_sample_target: z.number().int().positive(),
	}),
	typical: z.object({
		advances_pct: TypicalMetricRangeSchema.nullable(),
		delays_pct: TypicalMetricRangeSchema.nullable(),
		service_pct: TypicalMetricRangeSchema.nullable(),
	}),
});

export type RidePerformanceBaselineComparison = z.infer<typeof RidePerformanceBaselineComparisonSchema>;
export type RidePerformanceBaselineComparisonQueryInput = z.infer<typeof RidePerformanceBaselineComparisonQueryInputSchema>;

/* * */
