/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* DEMAND BY AGENCY */

const DemandByAgencySchema = MetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			qty: z.number(),
		}),
	),
	properties: z.object({
		agency_id: z.string(),
	}),
});

export const DemandByAgencyByYearSchema = DemandByAgencySchema.extend({
	metric: z.literal('demand_by_agency_by_year'),
});

export const DemandByAgencyByMonthSchema = DemandByAgencySchema.extend({
	metric: z.literal('demand_by_agency_by_month'),
});

export const DemandByAgencyByDaySchema = DemandByAgencySchema.extend({
	data: z.record(
		z.string(),
		z.object({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_agency_by_day'),
});

export const DemandByAgencyByDayByProductSchema = DemandByAgencySchema.extend({
	data: z.record(
		z.string(),
		z.object({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
			products: z.record(
				z.string().describe('Product ID'),
				z.number(),
			),
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_agency_by_day_by_product'),
});

export type DemandByAgencyByYear = z.infer<typeof DemandByAgencyByYearSchema>;
export type DemandByAgencyByMonth = z.infer<typeof DemandByAgencyByMonthSchema>;
export type DemandByAgencyByDay = z.infer<typeof DemandByAgencyByDaySchema>;
export type DemandByAgencyByDayByProduct = z.infer<typeof DemandByAgencyByDayByProductSchema>;
