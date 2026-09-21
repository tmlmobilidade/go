/* * */

import { GtfsShapesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubV1GtfsShapesSchema = GtfsShapesSchema;

/**
 * Representation of a GTFS shape for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsShapesInput = z.input<typeof HubV1GtfsShapesSchema>;

/**
 * Representation of a GTFS shape for the Hub V1 GTFS.
 */
export type HubV1GtfsShapes = z.output<typeof HubV1GtfsShapesSchema>;
