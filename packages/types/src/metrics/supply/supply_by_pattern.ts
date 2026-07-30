/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* SUPPLY BY PATTERN */

const SupplyByPatternDataSchema = z.object({
	accomplished_rides: z.number(),
	cost: z.number(),
	cost_per_pax: z.number(),
	passengers_observed: z.number(),
	net_result: z.number(),
	revenue: z.number(),
	revenue_per_pax: z.number(),
	scheduled_rides: z.number(),
	vkms_observed: z.number(),
	vkms_scheduled: z.number(),
});

const SupplyByPatternSchema = MetricBaseSchema.extend({
	data: z.record(z.string(), SupplyByPatternDataSchema),
	properties: z.object({
		pattern_id: z.string(),
	}),
});

export const SupplyByPatternByYearSchema = SupplyByPatternSchema.extend({
	metric: z.literal('supply_by_pattern_by_year'),
});

export const SupplyByPatternByMonthSchema = SupplyByPatternSchema.extend({
	metric: z.literal('supply_by_pattern_by_month'),
});

export const SupplyByPatternByDaySchema = SupplyByPatternSchema.extend({
	data: z.record(
		z.string(),
		SupplyByPatternDataSchema.extend({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
		}),
	),
	metric: z.literal('supply_by_pattern_by_day'),
});

export type SupplyByPatternByYear = z.infer<typeof SupplyByPatternByYearSchema>;
export type SupplyByPatternByMonth = z.infer<typeof SupplyByPatternByMonthSchema>;
export type SupplyByPatternByDay = z.infer<typeof SupplyByPatternByDaySchema>;
