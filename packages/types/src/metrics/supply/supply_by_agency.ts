/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* SUPPLY BY AGENCY */

const SupplyByAgencySchema = MetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			accomplished_rides: z.number(),
			cost_per_trip: z.number(),
			revenue_per_trip: z.number(),
			scheduled_rides: z.number(),
			vkms_observed: z.number(),
			vkms_scheduled: z.number(),
		}),
	),
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
		z.object({
			accomplished_rides: z.number(),
			cost_per_trip: z.number(),
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
			revenue_per_trip: z.number(),
			scheduled_rides: z.number(),
			vkms_observed: z.number(),
			vkms_scheduled: z.number(),
		}),
	),
	metric: z.literal('supply_by_agency_by_day'),
});

export type SupplyByAgencyByYear = z.infer<typeof SupplyByAgencyByYearSchema>;
export type SupplyByAgencyByMonth = z.infer<typeof SupplyByAgencyByMonthSchema>;
export type SupplyByAgencyByDay = z.infer<typeof SupplyByAgencyByDaySchema>;
