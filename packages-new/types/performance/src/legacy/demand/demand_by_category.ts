/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* DEMAND BY CATEGORY */

const DemandByCategorySchema = MetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			qty: z.number(),
		}),
	),
	properties: z.object({
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
	}),
});

export const DemandByCategoryByAgencyByDaySchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM-DD\' format'),
		z.object({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.boolean(),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_agency_by_day'),
	properties: z.object({
		agency_id: z.string(),
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
	}),
});

export const DemandByCategoryByAgencyByMonthSchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_agency_by_month'),
	properties: z.object({
		agency_id: z.string(),
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
	}),
});

export const DemandByCategoryByAgencyByYearSchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_agency_by_year'),
	properties: z.object({
		agency_id: z.string(),
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
	}),
});

export const DemandByCategoryByLineByDaySchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM-DD\' format'),
		z.object({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.boolean(),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_line_by_day'),
	properties: z.object({
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
		line_id: z.string(),
	}),
});

export const DemandByCategoryByLineByMonthSchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_line_by_month'),
	properties: z.object({
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
		line_id: z.string(),
	}),
});

export const DemandByCategoryByLineByYearSchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_line_by_year'),
	properties: z.object({
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
		line_id: z.string(),
	}),
});

export const DemandByCategoryByPatternByDaySchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM-DD\' format'),
		z.object({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.boolean(),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_pattern_by_day'),
	properties: z.object({
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
		pattern_id: z.string(),
	}),
});

export const DemandByCategoryByPatternByMonthSchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_pattern_by_month'),
	properties: z.object({
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
		pattern_id: z.string(),
	}),
});

export const DemandByCategoryByPatternByYearSchema = DemandByCategorySchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_category_by_pattern_by_year'),
	properties: z.object({
		category: z.enum(['prepaid', 'subscription', 'on_board_sale']),
		pattern_id: z.string(),
	}),
});

export type DemandByCategoryByAgencyByDay = z.infer<typeof DemandByCategoryByAgencyByDaySchema>;
export type DemandByCategoryByAgencyByMonth = z.infer<typeof DemandByCategoryByAgencyByMonthSchema>;
export type DemandByCategoryByAgencyByYear = z.infer<typeof DemandByCategoryByAgencyByYearSchema>;
export type DemandByCategoryByLineByDay = z.infer<typeof DemandByCategoryByLineByDaySchema>;
export type DemandByCategoryByLineByMonth = z.infer<typeof DemandByCategoryByLineByMonthSchema>;
export type DemandByCategoryByLineByYear = z.infer<typeof DemandByCategoryByLineByYearSchema>;
export type DemandByCategoryByPatternByDay = z.infer<typeof DemandByCategoryByPatternByDaySchema>;
export type DemandByCategoryByPatternByMonth = z.infer<typeof DemandByCategoryByPatternByMonthSchema>;
export type DemandByCategoryByPatternByYear = z.infer<typeof DemandByCategoryByPatternByYearSchema>;
