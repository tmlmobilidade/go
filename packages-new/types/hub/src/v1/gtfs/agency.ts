/* * */

import { GtfsAgencySchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubV1GtfsAgencySchema = GtfsAgencySchema.extend({
	agency_code: z.string(),
});

/**
 * Representation of a GTFS agency for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsAgencyInput = z.input<typeof HubV1GtfsAgencySchema>;

/**
 * Representation of a GTFS agency for the Hub V1 GTFS.
 */
export type HubV1GtfsAgency = z.output<typeof HubV1GtfsAgencySchema>;
