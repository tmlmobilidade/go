/* * */

import { GtfsStopsSchema } from '@tmlmobilidade/go-types-gtfs';
import { LifecycleStatusSchema, nullAsUndefined } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const HubV1GtfsStopsSchema = GtfsStopsSchema.extend({
	district_id: nullAsUndefined(z.string().default('')),
	district_name: nullAsUndefined(z.string().default('')),
	flags: nullAsUndefined(z.string().default('')),
	legacy_ids: nullAsUndefined(z.string().default('')),
	lifecycle_status: LifecycleStatusSchema.default('active'),
	locality_id: nullAsUndefined(z.string().nullable().default('')),
	locality_name: nullAsUndefined(z.string().nullable().default('')),
	municipality_id: z.string().default(''),
	municipality_name: nullAsUndefined(z.string().default('')),
	parish_id: nullAsUndefined(z.string().default('')),
	parish_name: nullAsUndefined(z.string().default('')),
});

/**
 * Representation of a GTFS stop for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsStopsInput = z.input<typeof HubV1GtfsStopsSchema>;

/**
 * Representation of a GTFS stop for the Hub V1 GTFS.
 */
export type HubV1GtfsStops = z.output<typeof HubV1GtfsStopsSchema>;
