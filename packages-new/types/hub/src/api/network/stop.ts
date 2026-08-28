/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { StopFlagSchema, StopIdSchema } from '@tmlmobilidade/go-types-infrastructure';
import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubStopSchema = z.object({
	_id: StopIdSchema,
	agency_ids: z.array(z.string()),
	district_id: z.string(),
	district_name: z.string(),
	flags: z.array(StopFlagSchema),
	latitude: LatitudeSchema,
	legacy_ids: z.array(z.string()),
	lifecycle_status: LifecycleStatusSchema,
	line_ids: z.array(z.string()),
	locality_id: z.string().nullable(),
	locality_name: z.string().nullable(),
	longitude: LongitudeSchema,
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
 * Stop data for the Hub Network API.
 */
export type HubStop = z.infer<typeof HubStopSchema>;

