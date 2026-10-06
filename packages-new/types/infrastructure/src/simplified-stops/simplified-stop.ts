/* * */

import { StopIdSchema } from '@/stops/stop-id.js';
import { LatitudeSchema, LongitudeSchema } from '@tmlmobilidade/go-types-geo';
import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SimplifiedStopSchema = z.object({
	_id: StopIdSchema,
	is_deleted: z.boolean().default(false),
	latitude: LatitudeSchema,
	legacy_ids: z.array(z.string()).default([]),
	lifecycle_status: LifecycleStatusSchema.default('draft'),
	location_country_admin_level: z.string(),
	location_country_name: z.string(),
	location_country_osm_id: z.number(),
	location_neighbourhood_admin_level: z.string().nullable().default(null),
	location_neighbourhood_name: z.string().nullable().default(null),
	location_neighbourhood_osm_id: z.number().nullable().default(null),
	location_primary_admin_level: z.string(),
	location_primary_code: z.string().nullable().default(null),
	location_primary_name: z.string(),
	location_primary_osm_id: z.number(),
	location_secondary_admin_level: z.string(),
	location_secondary_code: z.string().nullable().default(null),
	location_secondary_name: z.string(),
	location_secondary_osm_id: z.number(),
	location_tertiary_admin_level: z.string(),
	location_tertiary_code: z.string().nullable().default(null),
	location_tertiary_name: z.string(),
	location_tertiary_osm_id: z.number(),
	longitude: LongitudeSchema,
	name: z.string().min(2).max(100),
	short_name: z.string().min(2).max(55),
});

export type SimplifiedStop = z.infer<typeof SimplifiedStopSchema>;
