/* * */

import { z } from 'zod';

/* * */

export const HubGtfsExportStopsSchema = z.object({
	district_id: z.string(),
	district_name: z.string(),
	legacy_ids: z.string(),
	locality_id: z.string().optional(),
	locality_name: z.string().optional(),
	location_type: z.enum(['0', '1', '2', '3', '4']),
	municipality_id: z.string(),
	municipality_name: z.string(),
	parent_station: z.string(),
	parish_id: z.string(),
	parish_name: z.string(),
	platform_code: z.string(),
	stop_code: z.number(),
	stop_id: z.number(),
	stop_lat: z.number(),
	stop_lon: z.number(),
	stop_name: z.string(),
	tts_stop_name: z.string(),
	wheelchair_boarding: z.enum(['0', '1', '2']),
});

/**
 * Structure for the Hub GTFS export of the `stops.txt` file.
 */
export type HubGtfsExportStops = z.infer<typeof HubGtfsExportStopsSchema>;
