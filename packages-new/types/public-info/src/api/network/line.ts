/* * */

import { z } from 'zod';

/* * */

export const HubLineSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	color: z.string(),
	district_ids: z.array(z.string()).default([]),
	district_names: z.array(z.string()).default([]),
	facilities: z.array(z.string()).default([]),
	locality_ids: z.array(z.string()).default([]),
	locality_names: z.array(z.string()).default([]),
	long_name: z.string(),
	municipality_ids: z.array(z.string()).default([]),
	municipality_names: z.array(z.string()).default([]),
	parish_ids: z.array(z.string()).default([]),
	parish_names: z.array(z.string()).default([]),
	pattern_ids: z.array(z.string()).default([]),
	route_ids: z.array(z.string()).default([]),
	short_name: z.string(),
	stop_ids: z.array(z.string()).default([]),
	text_color: z.string(),
	tts_name: z.string(),
});

/**
 * Publishable line data for the Hub Network API.
 */
export type HubLine = z.infer<typeof HubLineSchema>;
