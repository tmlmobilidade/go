/* * */

import { HexColorSchema, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { HubPatternTripSchema } from './pattern-trip.js';
import { HubPatternWaypointSchema } from './pattern-waypoint.js';

/* * */

export const HubPatternSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	color: HexColorSchema,
	direction_id: z.union([z.literal(0), z.literal(1)]),
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
	path: z.array(HubPatternWaypointSchema),
	route_id: z.string(),
	shape_id: z.string(),
	short_name: z.string(),
	text_color: HexColorSchema,
	trips: z.array(HubPatternTripSchema),
	tts_headsign: z.string(),
	valid_on: z.array(OperationalDateIntSchema).default([]),
	version_id: z.string(),
});

/**
 * Publishable pattern data for the Hub Network API.
 */
export type HubPattern = z.infer<typeof HubPatternSchema>;
