/* * */

import { z } from 'zod';

/* * */

/** Scheduled service over the plan's inclusive active date range. */
export const PlanStatisticsSchema = z.object({
	distance_meters: z.number().int().nonnegative().safe(),
	line_count: z.number().int().nonnegative().safe(),
	trip_count: z.number().int().nonnegative().safe(),
});

export type PlanStatistics = z.infer<typeof PlanStatisticsSchema>;
