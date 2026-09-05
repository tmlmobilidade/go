/* * */

import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1ApiStopSchema = z.object({
	_id: z.string(),
	agency_ids: z.array(z.string()),
	district_id: z.string(),
	district_name: z.string(),
	flags: z.array(z.object({ agency_id: z.string(), stop_id: z.string() })),
	latitude: LatitudeSchema,
	legacy_ids: z.array(z.string()),
	lifecycle_status: LifecycleStatusSchema.optional(),
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
 * Stop data for the Hub V1 Stops API.
 */
export type HubV1ApiStop = z.infer<typeof HubV1ApiStopSchema>;

