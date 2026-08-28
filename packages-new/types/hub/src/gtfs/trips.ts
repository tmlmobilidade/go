/* * */

import { GtfsTripsSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportTripsSchema = GtfsTripsSchema;

/**
 * Representation of a GTFS trip for the Hub GTFS export.
 */
export type HubGtfsExportTrips = z.infer<typeof HubGtfsExportTripsSchema>;
