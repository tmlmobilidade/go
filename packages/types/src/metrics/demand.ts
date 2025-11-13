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

/* RECORD BY AGENCY */

export const TopDemandByAgencySchema = MetricBaseSchema.extend({
	data: z.object({
		operators: z.record(
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
		operators: z.record(
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
/* * */
