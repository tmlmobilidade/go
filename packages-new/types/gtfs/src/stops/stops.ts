/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { TimezoneIdentifiedSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsTernarySchema } from '../shared/ternary.js';
import { GtfsLocationTypeSchema } from './location-type.js';

/* * */

export const GtfsStopsSchema = z.object({
	level_id: z.string().default(''),
	location_type: GtfsLocationTypeSchema.default('0'),
	parent_station: z.string().default(''),
	platform_code: z.string().default(''),
	stop_code: z.string(),
	stop_desc: z.string().default(''),
	stop_id: z.string(),
	stop_lat: LatitudeSchema,
	stop_lon: LongitudeSchema,
	stop_name: z.string(),
	stop_timezone: TimezoneIdentifiedSchema.default('Europe/Lisbon'),
	stop_url: z.string().default(''),
	tts_stop_name: z.string().default(''),
	wheelchair_boarding: GtfsTernarySchema.optional(),
	zone_id: z.string().default(''),
});

/**
 * Represents a stop in the GTFS format.
 * A stop is a physical location where passengers can board or alight from a transit vehicle.
 * It includes information such as the stop ID, name, location, and type of service.
 */
export type GtfsStops = z.infer<typeof GtfsStopsSchema>;
