import { DemandByAgencyByDayByProductSchema, DemandByAgencyByDaySchema, DemandByAgencyByMonthSchema, DemandByAgencyByYearSchema, DemandByCategoryByAgencyByDaySchema, DemandByCategoryByAgencyByMonthSchema, DemandByCategoryByAgencyByYearSchema, DemandByCategoryByLineByDaySchema, DemandByCategoryByLineByMonthSchema, DemandByCategoryByLineByYearSchema, DemandByCategoryByPatternByDaySchema, DemandByCategoryByPatternByMonthSchema, DemandByCategoryByPatternByYearSchema, DemandByLineByDaySchema, DemandByLineByMonthSchema, DemandByLineByYearSchema, DemandByPatternByDaySchema, DemandByPatternByMonthSchema, DemandByPatternByYearSchema, DemandByPatternHourByDaySchema, DemandByPatternHourByMonthSchema, DemandByPatternHourByYearSchema, DemandByProductByAgencyByDaySchema, DemandByProductByAgencyByMonthSchema, DemandByProductByAgencyByYearSchema, DemandByProductByLineByDaySchema, DemandByProductByLineByMonthSchema, DemandByProductByLineByYearSchema, DemandByProductByPatternByDaySchema, DemandByProductByPatternByMonthSchema, DemandByProductByPatternByYearSchema, MeanDemandByLineByMonthSchema, TopDemandByAgencyByDayTypeSchema, TopDemandByAgencySchema, TopLines30DayPerformanceSchema, TopMeanDemandByLineByMonthSchema } from '@/metrics/demand/index.js';
import { DemandAffectedByFailedCirculationsByDaySchema } from '@/metrics/passenger-impact/passenger-impact.js';
import { RealtimeDemandSchema, RealtimeServiceComplianceSchema } from '@/metrics/realtime/index.js';
import { SupplyByAgencyByDaySchema, SupplyByAgencyByMonthSchema, SupplyByAgencyByYearSchema } from '@/metrics/supply/supply_by_agency.js';
import { SupplyByLineByDaySchema, SupplyByLineByMonthSchema, SupplyByLineByYearSchema } from '@/metrics/supply/supply_by_line.js';
import { SupplyByPatternByDaySchema, SupplyByPatternByMonthSchema, SupplyByPatternByYearSchema } from '@/metrics/supply/supply_by_pattern.js';
import { SupplyByPatternHourByDaySchema, SupplyByPatternHourByMonthSchema, SupplyByPatternHourByYearSchema } from '@/metrics/supply/supply_by_pattern_hour.js';
import { z } from 'zod';

/* * */

export * from './demand/index.js';
export * from './passenger-impact/index.js';
export * from './realtime/index.js';
export * from './supply/index.js';

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
	SupplyByAgencyByDaySchema,
	SupplyByAgencyByMonthSchema,
	SupplyByAgencyByYearSchema,
	SupplyByLineByDaySchema,
	SupplyByLineByMonthSchema,
	SupplyByLineByYearSchema,
	SupplyByPatternByDaySchema,
	SupplyByPatternByMonthSchema,
	SupplyByPatternByYearSchema,
	SupplyByPatternHourByDaySchema,
	SupplyByPatternHourByMonthSchema,
	SupplyByPatternHourByYearSchema,
	DemandAffectedByFailedCirculationsByDaySchema,
]);

/* * */

export type Metric = z.infer<typeof MetricSchema>;
