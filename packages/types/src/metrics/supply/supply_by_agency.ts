/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* SUPPLY BY AGENCY */

const SupplyByAgencyDataSchema = z.object({
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

const SupplyByAgencySchema = MetricBaseSchema.extend({
	data: z.record(z.string(), SupplyByAgencyDataSchema),
	properties: z.object({
		agency_id: z.string(),
	}),
});

export const SupplyByAgencyByYearSchema = SupplyByAgencySchema.extend({
	metric: z.literal('supply_by_agency_by_year'),
});

export const SupplyByAgencyByMonthSchema = SupplyByAgencySchema.extend({
	metric: z.literal('supply_by_agency_by_month'),
});

export const SupplyByAgencyByDaySchema = SupplyByAgencySchema.extend({
	data: z.record(
		z.string(),
		SupplyByAgencyDataSchema.extend({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
		}),
	),
	metric: z.literal('supply_by_agency_by_day'),
});

export type SupplyByAgencyByYear = z.infer<typeof SupplyByAgencyByYearSchema>;
export type SupplyByAgencyByMonth = z.infer<typeof SupplyByAgencyByMonthSchema>;
export type SupplyByAgencyByDay = z.infer<typeof SupplyByAgencyByDaySchema>;
