/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisMatchingApexLocationsSchema = RideAnalysisBaseSchema.extend({
	expected_apex_locations_qty: NonNegativeNumberSchema.nullable(),
	matching_apex_locations_qty: NonNegativeNumberSchema.nullable(),
	missing_apex_locations_qty: NonNegativeNumberSchema.nullable(),
	reason: z.enum(['NO_PATH_DATA', 'NO_APEX_LOCATIONS', 'MISSING_APEX_LOCATION_FOR_AT_LEAST_ONE_STOP', 'MATCHING_APEX_LOCATIONS']).nullable(),
});

/**
 * Tests whether there are missing APEX locations for the stops in the path data.
 * @param expected_apex_locations_qty The expected number of APEX locations.
 * @param matching_apex_locations_qty The number of APEX locations that match the expected APEX locations.
 * @param missing_apex_locations_qty The number of APEX locations that are missing for at least one stop in the path data.
 */
export type RideAnalysisMatchingApexLocations = z.infer<typeof RideAnalysisMatchingApexLocationsSchema>;
