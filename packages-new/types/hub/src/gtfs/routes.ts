/* * */

import { GtfsRoutesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportRoutesSchema = GtfsRoutesSchema;

/**
 * Representation of a GTFS route for the Hub GTFS export.
 */
export type HubGtfsExportRoutes = z.infer<typeof HubGtfsExportRoutesSchema>;
