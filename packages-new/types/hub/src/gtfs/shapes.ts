/* * */

import { GtfsShapesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubGtfsExportShapesSchema = GtfsShapesSchema;

/**
 * Representation of a GTFS shape for the Hub GTFS export.
 */
export type HubGtfsExportShapes = z.infer<typeof HubGtfsExportShapesSchema>;
