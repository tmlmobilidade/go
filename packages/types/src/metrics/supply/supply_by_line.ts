/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* SUPPLY BY LINE */

const SupplyByLineDataSchema = z.object({
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

const SupplyByLineSchema = MetricBaseSchema.extend({
	data: z.record(z.string(), SupplyByLineDataSchema),
	properties: z.object({
		line_id: z.string(),
	}),
});

export const SupplyByLineByYearSchema = SupplyByLineSchema.extend({
	metric: z.literal('supply_by_line_by_year'),
});

export const SupplyByLineByMonthSchema = SupplyByLineSchema.extend({
	metric: z.literal('supply_by_line_by_month'),
});

export const SupplyByLineByDaySchema = SupplyByLineSchema.extend({
	data: z.record(
		z.string(),
		SupplyByLineDataSchema.extend({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
		}),
	),
	metric: z.literal('supply_by_line_by_day'),
});

export type SupplyByLineByYear = z.infer<typeof SupplyByLineByYearSchema>;
export type SupplyByLineByMonth = z.infer<typeof SupplyByLineByMonthSchema>;
export type SupplyByLineByDay = z.infer<typeof SupplyByLineByDaySchema>;
