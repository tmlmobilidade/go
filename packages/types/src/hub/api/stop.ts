/* * */

import { LifecycleStatusSchema } from '@/_common/status.js';
import { StopFlagSchema } from '@/stops/flag.js';
import { StopIdSchema } from '@/stops/stop-id.js';
import { z } from 'zod';

/* * */

export const HubStopSchema = z.object({
	_id: StopIdSchema,
	district_id: z.string(),
	district_name: z.string(),
	flags: z.array(StopFlagSchema),
	latitude: z.number(),
	legacy_ids: z.array(z.string()),
	lifecycle_status: LifecycleStatusSchema,
	line_ids: z.array(z.string()),
	locality_id: z.string().nullable(),
	locality_name: z.string().nullable(),
	longitude: z.number(),
	municipality_id: z.string(),
	municipality_name: z.string(),
	name: z.string(),
	parish_id: z.string(),
	parish_name: z.string(),
	pattern_ids: z.array(z.string()),
	route_ids: z.array(z.string()),
	short_name: z.string(),
	tts_name: z.string(),
});

/**
 * Publishable stop data for the Hub Stops API.
 */
export type HubStop = z.infer<typeof HubStopSchema>;

