/* * */

import { EncodedPolylineSchema } from '@tmlmobilidade/go-types-geo';
import { GtfsTripDirectionSchema } from '@tmlmobilidade/go-types-gtfs';
import { HexColorSchema, NonNegativeIntegerSchema, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { HubV1ApiPatternTripSchema } from './pattern-trip.js';
import { HubV1ApiPatternWaypointSchema } from './pattern-waypoint.js';

/* * */

export const HubV1ApiPatternSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	color: HexColorSchema,
	direction_id: GtfsTripDirectionSchema,
	district_ids: z.array(z.string()).default([]),
	district_names: z.array(z.string()).default([]),
	facilities: z.array(z.string()).default([]),
	headsign: z.string(),
	line_id: z.string(),
	locality_ids: z.array(z.string()).default([]),
	locality_names: z.array(z.string()).default([]),
	long_name: z.string(),
	municipality_ids: z.array(z.string()).default([]),
	municipality_names: z.array(z.string()).default([]),
	parish_ids: z.array(z.string()).default([]),
	parish_names: z.array(z.string()).default([]),
	path: z.array(HubV1ApiPatternWaypointSchema),
	route_id: z.string(),
	shape_extension: NonNegativeIntegerSchema,
	shape_id: z.string(),
	shape_polyline: EncodedPolylineSchema,
	short_name: z.string(),
	text_color: HexColorSchema,
	trips: z.array(HubV1ApiPatternTripSchema),
	tts_headsign: z.string(),
	valid_on: z.array(OperationalDateIntSchema).default([]),
	version_id: z.string(),
});

/**
 * Publishable pattern data for the Hub V1 Patterns API.
 */
export type HubV1ApiPattern = z.infer<typeof HubV1ApiPatternSchema>;
