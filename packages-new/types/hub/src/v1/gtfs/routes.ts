/* * */

import { GtfsRoutesSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubV1GtfsRoutesSchema = GtfsRoutesSchema;

/**
 * Representation of a GTFS route for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsRoutesInput = z.input<typeof HubV1GtfsRoutesSchema>;

/**
 * Representation of a GTFS route for the Hub V1 GTFS.
 */
export type HubV1GtfsRoutes = z.output<typeof HubV1GtfsRoutesSchema>;
