/* * */

import { HexColorSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiLineSchema = z.object({
	_id: z.string(),
	agency_id: z.string(),
	color: HexColorSchema,
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
	text_color: HexColorSchema,
	tts_name: z.string(),
});

/**
 * Line data for the Hub V1 Lines API.
 */
export type HubV1ApiLine = z.infer<typeof HubV1ApiLineSchema>;
