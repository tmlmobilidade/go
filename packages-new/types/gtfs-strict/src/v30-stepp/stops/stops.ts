/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { z } from 'zod';

/* * */

export const GtfsStrictV30SteppStopsSchema = z.object({
	stop_code: z.string().optional(),
	stop_desc: z.string(),
	stop_id: z.string(),
	stop_lat: LatitudeSchema,
	stop_lon: LongitudeSchema,
	stop_name: z.string(),
	zone_id: z.string().optional(),

});

/**
 * Represents a stop in the GTFS Strict v30 STEPP format.
 * A stop is a physical location where passengers can board or alight from a transit vehicle.
 * It includes information such as the stop ID, name, location, and zone ID.
 */
export type GtfsStrictV30SteppStops = z.infer<typeof GtfsStrictV30SteppStopsSchema>;
