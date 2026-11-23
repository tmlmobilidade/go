/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { GtfsLocationTypeSchema, GtfsTernarySchema } from '@tmlmobilidade/go-types-gtfs';
import { nullAsUndefined } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const GtfsStrictV30StopsSchema = z.object({
	level_id: nullAsUndefined(z.string().optional()),
	location_type: nullAsUndefined(GtfsLocationTypeSchema.optional()),
	parent_station: nullAsUndefined(z.string().optional()),
	platform_code: nullAsUndefined(z.string().optional()),
	stop_code: z.string(),
	stop_id: z.string(),
	stop_lat: LatitudeSchema,
	stop_lon: LongitudeSchema,
	stop_name: z.string(),
	wheelchair_boarding: nullAsUndefined(GtfsTernarySchema.optional()),
});

/**
 * Represents a stop in the GTFS Strict v30 format.
 * A stop is a physical location where passengers can board or alight from a transit vehicle.
 * It includes information such as the stop ID, name, location, and type of service.
 */
export type GtfsStrictV30Stops = z.infer<typeof GtfsStrictV30StopsSchema>;
