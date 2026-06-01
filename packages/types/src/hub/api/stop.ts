/* * */

import { StopSchema } from '@/stops/stop.js';
import { z } from 'zod';

/* * */

export const HubStopSchema = StopSchema.pick({
	_id: true,
	district_id: true,
	flags: true,
	latitude: true,
	legacy_ids: true,
	lifecycle_status: true,
	locality_id: true,
	longitude: true,
	municipality_id: true,
	name: true,
	parish_id: true,
	short_name: true,
	tts_name: true,
}).extend({
	district_name: z.string(),
	line_ids: z.array(z.string()),
	locality_name: z.string(),
	municipality_name: z.string(),
	parish_name: z.string(),
	pattern_ids: z.array(z.string()),
	route_ids: z.array(z.string()),
});

/**
 * Publishable stop data for the Hub Stops API.
 */
export type HubStop = z.infer<typeof HubStopSchema>;

