/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { z } from 'zod';

/* * */

export const RideAnalysisMatchingApexLocationsSchema = RideAnalysisBaseSchema.extend({
	reason: z.enum(['NO_PATH_DATA', 'NO_APEX_LOCATIONS', 'MISSING_APEX_LOCATION_FOR_AT_LEAST_ONE_STOP', 'MATCHING_APEX_LOCATIONS']).nullable(),
});

export type RideAnalysisMatchingApexLocations = z.infer<typeof RideAnalysisMatchingApexLocationsSchema>;
