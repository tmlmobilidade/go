/* * */

import { z } from 'zod';

/* * */

/** Number of data records in the plan's normalized GTFS trips.txt. */
export const PlanStatisticsSchema = z.object({
	trip_count: z.number().int().nonnegative().safe(),
});

export type PlanStatistics = z.infer<typeof PlanStatisticsSchema>;
