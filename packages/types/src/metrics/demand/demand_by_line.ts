/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* DEMAND BY LINE */

const DemandByLineSchema = MetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			qty: z.number(),
		}),
	),
	properties: z.object({
		line_id: z.string(),
	}),
});

export const DemandByLineByYearSchema = DemandByLineSchema.extend({
	metric: z.literal('demand_by_line_by_year'),
});

export const DemandByLineByMonthSchema = DemandByLineSchema.extend({
	metric: z.literal('demand_by_line_by_month'),
});

export const DemandByLineByDaySchema = DemandByLineSchema.extend({
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
	metric: z.literal('demand_by_line_by_day'),
});

// data:  "2025-03": {
//     "weekday": { "qty": 9300, "count": 31, "avg": 300 },
//     "saturday": { "qty": 600, "count": 4, "avg": 150 },
//     "sunday": { "qty": 200, "count": 4, "avg": 50 }
//   },

export const MeanDemandByLineByMonthSchema = DemandByLineSchema.extend({
	data: z.record(
		z.string(),
		z.record(
			z.string(),
			z.object({
				avg: z.number().optional(),
				count: z.number(),
				qty: z.number(),
			}),
		),
	),
	metric: z.literal('mean_demand_by_line_by_month'),
});

//   data: {
//     "12345": { increase: 20, qty: 4800, year_avg: 4000 },
//     "67890": { increase: 18, qty: 3700, year_avg: 3130 },
//   },

export const TopMeanDemandByLineByMonthSchema = DemandByLineSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			increase_pct: z.number(),
			qty: z.number(),
			year_avg: z.number(),
		}),
	),
	metric: z.literal('top_mean_demand_by_line_by_month'),
	properties: z.object({
		year_month: z.string(),
	}),
});

export type DemandByLineByYear = z.infer<typeof DemandByLineByYearSchema>;
export type DemandByLineByMonth = z.infer<typeof DemandByLineByMonthSchema>;
export type DemandByLineByDay = z.infer<typeof DemandByLineByDaySchema>;
export type MeanDemandByLineByMonth = z.infer<typeof MeanDemandByLineByMonthSchema>;
export type TopMeanDemandByLineByMonth = z.infer<typeof TopMeanDemandByLineByMonthSchema>;
