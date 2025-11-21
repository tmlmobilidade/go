import { DemandByAgencyByDayByProductSchema, DemandByAgencyByDaySchema, DemandByAgencyByMonthSchema, DemandByAgencyByYearSchema, DemandByCategoryByAgencyByDaySchema, DemandByCategoryByAgencyByMonthSchema, DemandByCategoryByAgencyByYearSchema, DemandByCategoryByLineByDaySchema, DemandByCategoryByLineByMonthSchema, DemandByCategoryByLineByYearSchema, DemandByCategoryByPatternByDaySchema, DemandByCategoryByPatternByMonthSchema, DemandByCategoryByPatternByYearSchema, DemandByLineByDaySchema, DemandByLineByMonthSchema, DemandByLineByYearSchema, DemandByPatternByDaySchema, DemandByPatternByMonthSchema, DemandByPatternByYearSchema, DemandByPatternHourByDaySchema, DemandByPatternHourByMonthSchema, DemandByPatternHourByYearSchema, DemandByProductByAgencyByDaySchema, DemandByProductByAgencyByMonthSchema, DemandByProductByAgencyByYearSchema, DemandByProductByLineByDaySchema, DemandByProductByLineByMonthSchema, DemandByProductByLineByYearSchema, DemandByProductByPatternByDaySchema, DemandByProductByPatternByMonthSchema, DemandByProductByPatternByYearSchema, MeanDemandByLineByMonthSchema, TopDemandByAgencyByDayTypeSchema, TopDemandByAgencySchema, TopLines30DayPerformanceSchema, TopMeanDemandByLineByMonthSchema } from '@/metrics/demand/index.js';
import { z } from 'zod';

import { RealtimeDemandSchema, RealtimeServiceComplianceSchema } from './realtime.js';

/* * */

export * from './demand/index.js';
export * from './realtime.js';

/* * */

// Define this automatically to include all metric schemas
export const MetricSchema = z.discriminatedUnion('metric', [
	DemandByLineByYearSchema,
	DemandByLineByMonthSchema,
	DemandByLineByDaySchema,
	DemandByPatternByYearSchema,
	DemandByPatternByMonthSchema,
	DemandByPatternByDaySchema,
	DemandByPatternHourByYearSchema,
	DemandByPatternHourByMonthSchema,
	DemandByPatternHourByDaySchema,
	DemandByAgencyByYearSchema,
	DemandByAgencyByMonthSchema,
	DemandByAgencyByDaySchema,
	DemandByAgencyByDayByProductSchema,
	DemandByProductByAgencyByDaySchema,
	DemandByProductByAgencyByMonthSchema,
	DemandByProductByAgencyByYearSchema,
	DemandByProductByLineByDaySchema,
	DemandByProductByLineByMonthSchema,
	DemandByProductByLineByYearSchema,
	DemandByProductByPatternByDaySchema,
	DemandByProductByPatternByMonthSchema,
	DemandByProductByPatternByYearSchema,
	DemandByCategoryByAgencyByDaySchema,
	DemandByCategoryByAgencyByMonthSchema,
	DemandByCategoryByAgencyByYearSchema,
	DemandByCategoryByLineByDaySchema,
	DemandByCategoryByLineByMonthSchema,
	DemandByCategoryByLineByYearSchema,
	DemandByCategoryByPatternByDaySchema,
	DemandByCategoryByPatternByMonthSchema,
	DemandByCategoryByPatternByYearSchema,
	TopDemandByAgencySchema,
	MeanDemandByLineByMonthSchema,
	TopMeanDemandByLineByMonthSchema,
	RealtimeDemandSchema,
	RealtimeServiceComplianceSchema,
	TopDemandByAgencyByDayTypeSchema,
	TopLines30DayPerformanceSchema,
]);

/* * */

export type Metric = z.infer<typeof MetricSchema>;
