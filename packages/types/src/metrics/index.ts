import { DemandByAgencyByDaySchema, DemandByAgencyByMonthSchema, DemandByAgencyByYearSchema, DemandByLineByDaySchema, DemandByLineByMonthSchema, DemandByLineByYearSchema, DemandByPatternByDaySchema, DemandByPatternByMonthSchema, DemandByPatternByYearSchema, DemandByPatternHourByMonthSchema, DemandByPatternHourByYearSchema, MeanDemandByLineByMonthSchema, TopDemandByAgencySchema, TopMeanDemandByLineByMonthSchema } from '@/metrics/demand.js';
import { z } from 'zod';
import { RealtimeDemandSchema, RealtimeServiceComplianceSchema } from './realtime.js';

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
	DemandByAgencyByYearSchema,
	DemandByAgencyByMonthSchema,
	DemandByAgencyByDaySchema,
	TopDemandByAgencySchema,
	MeanDemandByLineByMonthSchema,
	TopMeanDemandByLineByMonthSchema,
	RealtimeDemandSchema,
	RealtimeServiceComplianceSchema,
]);

/* * */

export type Metric = z.infer<typeof MetricSchema>;
export type DemandByLineByYear = z.infer<typeof DemandByLineByYearSchema>;
export type DemandByLineByMonth = z.infer<typeof DemandByLineByMonthSchema>;
export type DemandByLineByDay = z.infer<typeof DemandByLineByDaySchema>;
export type DemandByPatternByYear = z.infer<typeof DemandByPatternByYearSchema>;
export type DemandByPatternByMonth = z.infer<typeof DemandByPatternByMonthSchema>;
export type DemandByPatternByDay = z.infer<typeof DemandByPatternByDaySchema>;
export type DemandByPatternHourByYear = z.infer<typeof DemandByPatternHourByYearSchema>;
export type DemandByPatternHourByMonth = z.infer<typeof DemandByPatternHourByMonthSchema>;
export type DemandByAgencyByYear = z.infer<typeof DemandByAgencyByYearSchema>;
export type DemandByAgencyByMonth = z.infer<typeof DemandByAgencyByMonthSchema>;
export type DemandByAgencyByDay = z.infer<typeof DemandByAgencyByDaySchema>;
export type TopDemandByAgency = z.infer<typeof TopDemandByAgencySchema>;
export type MeanDemandByLineByMonth = z.infer<typeof MeanDemandByLineByMonthSchema>;
export type TopMeanDemandByLineByMonth = z.infer<typeof TopMeanDemandByLineByMonthSchema>;
export type RealtimeDemand = z.infer<typeof RealtimeDemandSchema>;
export type RealtimeServiceCompliance = z.infer<typeof RealtimeServiceComplianceSchema>;
