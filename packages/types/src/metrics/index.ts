import { DemandByAgencyByDayByProductSchema, DemandByAgencyByDaySchema, DemandByAgencyByMonthSchema, DemandByAgencyByYearSchema, DemandByLineByDaySchema, DemandByLineByMonthSchema, DemandByLineByYearSchema, DemandByPatternByDaySchema, DemandByPatternByMonthSchema, DemandByPatternByYearSchema, DemandByPatternHourByDaySchema, DemandByPatternHourByMonthSchema, DemandByPatternHourByYearSchema, DemandByProductByAgencyByDaySchema, DemandByProductByAgencyByMonthSchema, DemandByProductByAgencyByYearSchema, DemandByProductByLineByDaySchema, DemandByProductByLineByMonthSchema, DemandByProductByLineByYearSchema, MeanDemandByLineByMonthSchema, TopDemandByAgencyByDayTypeSchema, TopDemandByAgencySchema, TopLines30DayPerformanceSchema, TopMeanDemandByLineByMonthSchema } from '@/metrics/demand/index.js';
import { z } from 'zod';

import { RealtimeDemandSchema, RealtimeServiceComplianceSchema } from './realtime.js';

/* * */

export * from './demand/index.js';
export * from './realtime.js';

/* * */

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
