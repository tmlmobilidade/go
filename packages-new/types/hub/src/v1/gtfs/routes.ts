/* * */

import { GtfsRoutesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportRoutesSchema = GtfsRoutesSchema;

/**
 * Representation of a GTFS route for the Hub GTFS export that is being created.
 */
export type HubGtfsExportRoutesInput = z.input<typeof HubGtfsExportRoutesSchema>;

/**
 * Representation of a GTFS route for the Hub GTFS export.
 */
export type HubGtfsExportRoutes = z.output<typeof HubGtfsExportRoutesSchema>;
