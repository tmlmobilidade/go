/* * */

import { MetricBaseSchema } from '@/metrics/common.js';
import { z } from 'zod';

/* DEMAND AFFECTED BY FAILED CIRCULATIONS */

export const DemandAffectedByFailedCirculationsSchema = MetricBaseSchema.extend({
	data: z.record(
		z.string().describe('Time key (e.g., YYYY-MM-DD / YYYY-MM / YYYY)'),
		z.object({
			// Circulations that failed (or were considered failed) within the target interval
			failed_circulations: z.number(),

			// Median number of validations over the last 30 days
			estimated_affected_passengers: z.number(),
		}),
	),

	/**
	 * Agency_id used as the base aggregation key
	 */
	properties: z.object({
		agency_id: z.string(),
	}),
});

/** Variants: by_day */
export const DemandAffectedByFailedCirculationsByDaySchema = DemandAffectedByFailedCirculationsSchema.extend({
	metric: z.literal('demand_affected_by_failed_circulations_by_day'),
});

/** Types */
export type DemandAffectedByFailedCirculationsByDay = z.infer<typeof DemandAffectedByFailedCirculationsByDaySchema>;
