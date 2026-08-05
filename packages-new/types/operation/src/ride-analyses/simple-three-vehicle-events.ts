/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/ride-analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisSimpleThreeVehicleEventsSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'MISSING_FIRST_STOPS', 'MISSING_MIDDLE_STOPS', 'MISSING_LAST_STOPS', 'ALL_STOPS_FOUND']).nullable().default(null),
	stop_ids_first: z.array(z.string()).nullable().default(null),
	stop_ids_last: z.array(z.string()).nullable().default(null),
	stop_ids_middle: z.array(z.string()).nullable().default(null),
});

/**
 * Tests whether there are at least one vehicle event for the first, middle and last stops,
 * using the stop_id from the GTFS vehicle events data.
 * @param stop_ids_first The stop_ids for the group of stops in the beginning of the path.
 * @param stop_ids_middle The stop_ids for the group of stops in the middle of the path.
 * @param stop_ids_last The stop_ids for the group of stops in the end of the path.
 */
export type RideAnalysisSimpleThreeVehicleEvents = z.infer<typeof RideAnalysisSimpleThreeVehicleEventsSchema>;
