/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* DEMAND BY PRODUCT */

const DemandByProductSchema = MetricBaseSchema.extend({
	data: z.record(
		z.string(),
		z.object({
			qty: z.number(),
		}),
	),
	properties: z.object({
		product_id: z.string(),
	}),
});

export const DemandByProductByAgencyByDaySchema = DemandByProductSchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM-DD\' format'),
		z.object({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_product_by_agency_by_day'),
	properties: z.object({
		agency_id: z.string(),
		product_id: z.string(),
	}),
});

export const DemandByProductByAgencyByMonthSchema = DemandByProductSchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_product_by_agency_by_month'),
	properties: z.object({
		agency_id: z.string(),
		product_id: z.string(),
	}),
});

export const DemandByProductByAgencyByYearSchema = DemandByProductSchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_product_by_agency_by_year'),
	properties: z.object({
		agency_id: z.string(),
		product_id: z.string(),
	}),
});

export const DemandByProductByLineByDaySchema = DemandByProductSchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM-DD\' format'),
		z.object({
			day_type: z.enum(['1', '2', '3']),
			holiday: z.enum(['0', '1']),
			notes: z.string().nullable(),
			period: z.enum(['1', '2', '3']),
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_product_by_line_by_day'),
	properties: z.object({
		line_id: z.string(),
		product_id: z.string(),
	}),
});

export const DemandByProductByLineByMonthSchema = DemandByProductSchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_product_by_line_by_month'),
	properties: z.object({
		line_id: z.string(),
		product_id: z.string(),
	}),
});

export const DemandByProductByLineByYearSchema = DemandByProductSchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_product_by_line_by_year'),
	properties: z.object({
		line_id: z.string(),
		product_id: z.string(),
	}),
});

export const DemandByProductByPatternByDaySchema = DemandByProductSchema.extend({
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
	metric: z.literal('demand_by_product_by_pattern_by_day'),
	properties: z.object({
		pattern_id: z.string(),
		product_id: z.string(),
	}),
});

export const DemandByProductByPatternByMonthSchema = DemandByProductSchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY-MM\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_product_by_pattern_by_month'),
	properties: z.object({
		pattern_id: z.string(),
		product_id: z.string(),
	}),
});

export const DemandByProductByPatternByYearSchema = DemandByProductSchema.extend({
	data: z.record(
		z.string().describe('Date in \'YYYY\' format'),
		z.object({
			qty: z.number(),
		}),
	),
	metric: z.literal('demand_by_product_by_pattern_by_year'),
	properties: z.object({
		pattern_id: z.string(),
		product_id: z.string(),
	}),
});

export type DemandByProductByAgencyByDay = z.infer<typeof DemandByProductByAgencyByDaySchema>;
export type DemandByProductByAgencyByMonth = z.infer<typeof DemandByProductByAgencyByMonthSchema>;
export type DemandByProductByAgencyByYear = z.infer<typeof DemandByProductByAgencyByYearSchema>;
export type DemandByProductByLineByDay = z.infer<typeof DemandByProductByLineByDaySchema>;
export type DemandByProductByLineByMonth = z.infer<typeof DemandByProductByLineByMonthSchema>;
export type DemandByProductByLineByYear = z.infer<typeof DemandByProductByLineByYearSchema>;
export type DemandByProductByPatternByDay = z.infer<typeof DemandByProductByPatternByDaySchema>;
export type DemandByProductByPatternByMonth = z.infer<typeof DemandByProductByPatternByMonthSchema>;
export type DemandByProductByPatternByYear = z.infer<typeof DemandByProductByPatternByYearSchema>;
