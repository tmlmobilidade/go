/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisSimpleThreeVehicleEventsSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_VEHICLE_EVENTS', 'MISSING_FIRST_STOPS', 'MISSING_MIDDLE_STOPS', 'MISSING_LAST_STOPS', 'ALL_STOPS_FOUND']).nullable(),
	stop_ids_first: z.array(z.string()).nullable(),
	stop_ids_last: z.array(z.string()).nullable(),
	stop_ids_middle: z.array(z.string()).nullable(),
});

export type RideAnalysisSimpleThreeVehicleEvents = z.infer<typeof RideAnalysisSimpleThreeVehicleEventsSchema>;
