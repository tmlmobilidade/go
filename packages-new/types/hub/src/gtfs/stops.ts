/* * */

import { GtfsStopsSchema } from '@tmlmobilidade/go-types-gtfs';
import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubGtfsExportStopsSchema = GtfsStopsSchema.extend({
	district_id: z.string(),
	district_name: z.string(),
	flags: z.string(),
	legacy_ids: z.string(),
	lifecycle_status: LifecycleStatusSchema,
	locality_id: z.string().optional(),
	locality_name: z.string().optional(),
	municipality_id: z.string(),
	municipality_name: z.string(),
	parish_id: z.string(),
	parish_name: z.string(),
});

/**
 * Representation of a GTFS stop for the Hub GTFS export.
 */
export type HubGtfsExportStops = z.infer<typeof HubGtfsExportStopsSchema>;
