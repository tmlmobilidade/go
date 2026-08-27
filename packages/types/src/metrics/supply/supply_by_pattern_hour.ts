/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* SUPPLY BY PATTERN HOUR */

const SupplyByPatternHourDataSchema = z.object({
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

const SupplyByPatternHourSchema = MetricBaseSchema.extend({
	data: z.record(z.string(), SupplyByPatternHourDataSchema),
	properties: z.object({
		pattern_hour: z.string(),
	}),
});

export const SupplyByPatternHourByYearSchema = SupplyByPatternHourSchema.extend({
	metric: z.literal('supply_by_pattern_hour_by_year'),
});

export const SupplyByPatternHourByMonthSchema = SupplyByPatternHourSchema.extend({
	metric: z.literal('supply_by_pattern_hour_by_month'),
});

export const SupplyByPatternHourByDaySchema = SupplyByPatternHourSchema.extend({
	data: z.record(
		z.string(),
		SupplyByPatternHourDataSchema.extend({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
		}),
	),
	metric: z.literal('supply_by_pattern_hour_by_day'),
});

export type SupplyByPatternHourByYear = z.infer<typeof SupplyByPatternHourByYearSchema>;
export type SupplyByPatternHourByMonth = z.infer<typeof SupplyByPatternHourByMonthSchema>;
export type SupplyByPatternHourByDay = z.infer<typeof SupplyByPatternHourByDaySchema>;
