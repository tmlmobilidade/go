/* * */

import { GtfsTripsSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV29TripsSchema = GtfsTripsSchema.extend({
	calendar_desc: z.string(),
	pattern_id: z.string(),
	pattern_short_name: z.string(),
});

/**
 * Represents a trip in the custom GTFS strict v1 format.
 * A trip is the definition of a service of a given route,
 * scheduled to run on specific dates (`service_id`) and times (`stop_times`).
 * It also includes the `calendar_desc`, `pattern_id`, and `pattern_short_name` fields.
 */
export type GtfsStrictV29Trips = z.infer<typeof GtfsStrictV29TripsSchema>;
