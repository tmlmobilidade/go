/* * */

import { GtfsAgencySchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportAgencySchema = GtfsAgencySchema;

/**
 * Representation of a GTFS agency for the Hub GTFS export.
 */
export type HubGtfsExportAgency = z.infer<typeof HubGtfsExportAgencySchema>;
