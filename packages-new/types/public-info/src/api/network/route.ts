/* * */

import { z } from 'zod';

/* * */

export const HubRouteSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	color: z.string(),
	district_ids: z.array(z.string()).default([]),
	facilities: z.array(z.string()).default([]),
	line_id: z.string(),
	locality_ids: z.array(z.string()).default([]),
	long_name: z.string(),
	municipality_ids: z.array(z.string()).default([]),
	pattern_ids: z.array(z.string()).default([]),
	region_ids: z.array(z.string()).default([]),
	short_name: z.string(),
	stop_ids: z.array(z.string()).default([]),
	text_color: z.string(),
	tts_name: z.string(),
});

/**
 * Publishable route data for the Hub Network API.
 */
export type HubRoute = z.infer<typeof HubRouteSchema>;
