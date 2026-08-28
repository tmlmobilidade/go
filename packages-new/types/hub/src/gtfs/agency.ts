/* * */

import { GtfsAgencySchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportAgencySchema = GtfsAgencySchema.extend({
	agency_code: z.string(),
});

/**
 * Representation of a GTFS agency for the Hub GTFS export.
 */
export type HubGtfsExportAgency = z.infer<typeof HubGtfsExportAgencySchema>;
