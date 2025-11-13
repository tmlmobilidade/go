import { z } from 'zod';

/* * */

import { MetricBaseSchema } from '@/metrics/common.js';

/* * */

const NowLastWeekSchema = z.object({
	last_week: z.number(),
	now: z.number(),
});

/* REALTIME DEMAND */

export const RealtimeDemandSchema = MetricBaseSchema.extend({
	data: z.object({
		operators: z.record(
			z.string(),
			NowLastWeekSchema,
		),
		total: NowLastWeekSchema,
	}),
	metric: z.literal('realtime_demand'),
});

export const RealtimeServiceComplianceSchema = MetricBaseSchema.extend({
	data: z.object({
		operators: z.record(
			z.string(),
			z.object({
				advanced_rides: NowLastWeekSchema,
				five_min_delays: NowLastWeekSchema,
				mean_delay_minutes: NowLastWeekSchema,
				no_passengers_rides: NowLastWeekSchema,
				rides_with_sales: NowLastWeekSchema,
				scheduled_rides: NowLastWeekSchema,
				valid_rides: NowLastWeekSchema,

			}),
		),
		total: z.object({
			advanced_rides: NowLastWeekSchema,
			five_min_delays: NowLastWeekSchema,
			mean_delay_minutes: NowLastWeekSchema,
			no_passengers_rides: NowLastWeekSchema,
			rides_with_sales: NowLastWeekSchema,
			scheduled_rides: NowLastWeekSchema,
			valid_rides: NowLastWeekSchema,

		}),
	}),
	metric: z.literal('realtime_service_compliance'),
});
