/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* DEMAND BY PATTERN */

const DemandByPatternSchema = MetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			qty: z.number(),
		}),
	),
	properties: z.object({
		pattern_id: z.string(),
	}),
});

export const DemandByPatternByYearSchema = DemandByPatternSchema.extend({
	metric: z.literal('demand_by_pattern_by_year'),
	properties: z.object({
		pattern_id: z.string(),
	}),
});

export const DemandByPatternByMonthSchema = DemandByPatternSchema.extend({
	metric: z.literal('demand_by_pattern_by_month'),
});

export const DemandByPatternByDaySchema = DemandByPatternSchema.extend({
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
	metric: z.literal('demand_by_pattern_by_day'),
});

/* DEMAND BY PATTERN_HOUR */

export const DemandByPatternHourByYearSchema = DemandByPatternSchema.extend({
	metric: z.literal('demand_by_pattern_hour_by_year'),
	properties: z.object({
		hour: z.number().min(0).max(23),
		minute: z.number().min(0).max(59),
		pattern_id: z.string(),
	}),
});

export const DemandByPatternHourByMonthSchema = DemandByPatternSchema.extend({
	metric: z.literal('demand_by_pattern_hour_by_month'),
	properties: z.object({
		hour: z.number().min(0).max(23),
		minute: z.number().min(0).max(59),
		pattern_id: z.string(),
	}),
});

export const DemandByPatternHourByDaySchema = DemandByPatternSchema.extend({
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
	metric: z.literal('demand_by_pattern_hour_by_day'),
	properties: z.object({
		hour: z.number().min(0).max(23),
		line_id: z.string(),
		minute: z.number().min(0).max(59),
		pattern_id: z.string(),
	}),
});

export type DemandByPatternByYear = z.infer<typeof DemandByPatternByYearSchema>;
export type DemandByPatternByMonth = z.infer<typeof DemandByPatternByMonthSchema>;
export type DemandByPatternByDay = z.infer<typeof DemandByPatternByDaySchema>;

export type DemandByPatternHourByYear = z.infer<typeof DemandByPatternHourByYearSchema>;
export type DemandByPatternHourByMonth = z.infer<typeof DemandByPatternHourByMonthSchema>;
export type DemandByPatternHourByDay = z.infer<typeof DemandByPatternHourByDaySchema>;
