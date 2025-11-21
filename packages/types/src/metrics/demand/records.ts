/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* RECORD BY AGENCY */

export const TopDemandByAgencySchema = MetricBaseSchema.extend({
	data: z.object({
		agencies: z.record(
			z.string(),
			z.object({
				day: z.object({
					date: z.string(),
					qty: z.number(),
				}),
				month: z.object({
					date: z.string(),
					qty: z.number(),
				}),
			}),
		),
		total: z.object({
			day: z.object({
				date: z.string(),
				qty: z.number(),
			}),
			month: z.object({
				date: z.string(),
				qty: z.number(),
			}),
		}),
	}),
	metric: z.literal('top_demand_by_agency'),
});

export const TopDemandByAgencyByDayTypeSchema = MetricBaseSchema.extend({
	data: z.object({
		agencies: z.record(
			z.string().describe('Agency ID'),
			z.record(
				z.enum(['day_type_1', 'day_type_2', 'day_type_3']),
				z.record(
					z.string().describe('Date in \'YYYY-MM-DD\' format'),
					z.number(),
				),
			),
		),
		total: z.record(
			z.enum(['day_type_1', 'day_type_2', 'day_type_3']),
			z.record(
				z.string().describe('Date in \'YYYY-MM-DD\' format'),
				z.number(),
			),
		),
	}),
	metric: z.literal('top_demand_by_agency_by_day_type'),
});

export const TopLines30DayPerformanceSchema = MetricBaseSchema.extend({
	data: z.object({
		top_performers: z.record(
			z.string().describe('Line ID'),
			z.object({
				increase_pct: z.number(),
				last_30_days_by_day_type: z.record(
					z.enum(['day_type_1', 'day_type_2', 'day_type_3']),
					z.number(),
				),
				last_30_days_total: z.number(),
				ytd_avg: z.number(),
			}),
		),
		worst_performers: z.record(
			z.string().describe('Line ID'),
			z.object({
				increase_pct: z.number(),
				last_30_days_by_day_type: z.record(
					z.enum(['day_type_1', 'day_type_2', 'day_type_3']),
					z.number(),
				),
				last_30_days_total: z.number(),
				ytd_avg: z.number(),
			}),
		),
	}),
	metric: z.literal('top_lines_30day_performance'),
});

export type TopDemandByAgency = z.infer<typeof TopDemandByAgencySchema>;
export type TopDemandByAgencyByDayType = z.infer<typeof TopDemandByAgencyByDayTypeSchema>;
export type TopLines30DayPerformance = z.infer<typeof TopLines30DayPerformanceSchema>;
