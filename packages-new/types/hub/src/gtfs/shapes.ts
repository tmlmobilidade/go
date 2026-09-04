/* * */

import { GtfsShapesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportShapesSchema = GtfsShapesSchema;

/**
 * Representation of a GTFS shape for the Hub GTFS export that is being created.
 */
export type HubGtfsExportShapesInput = z.input<typeof HubGtfsExportShapesSchema>;

/**
 * Representation of a GTFS shape for the Hub GTFS export.
 */
export type HubGtfsExportShapes = z.output<typeof HubGtfsExportShapesSchema>;
