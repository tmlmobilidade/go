/* * */

import { GtfsStopsSchema } from '@tmlmobilidade/go-types-gtfs';
import { LifecycleStatusSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubGtfsExportStopsSchema = GtfsStopsSchema.extend({
	district_id: z.string().default(''),
	district_name: z.string().default(''),
	flags: z.string().default(''),
	legacy_ids: z.string().default(''),
	lifecycle_status: LifecycleStatusSchema.default('active'),
	locality_id: z.string().nullable().default(''),
	locality_name: z.string().nullable().default(''),
	municipality_id: z.string().default(''),
	municipality_name: z.string().default(''),
	parish_id: z.string().default(''),
	parish_name: z.string().default(''),
});

/**
 * Representation of a GTFS stop for the Hub GTFS export that is being created.
 */
export type HubGtfsExportStopsInput = z.input<typeof HubGtfsExportStopsSchema>;

/**
 * Representation of a GTFS stop for the Hub GTFS export.
 */
export type HubGtfsExportStops = z.output<typeof HubGtfsExportStopsSchema>;
