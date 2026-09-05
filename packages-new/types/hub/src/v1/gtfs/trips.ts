/* * */

import { GtfsTripsSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const HubV1GtfsTripsSchema = GtfsTripsSchema;

/**
 * Representation of a GTFS trip for the Hub V1 GTFS that is being created.
 */
export type HubV1GtfsTripsInput = z.input<typeof HubV1GtfsTripsSchema>;

/**
 * Representation of a GTFS trip for the Hub V1 GTFS.
 */
export type HubV1GtfsTrips = z.output<typeof HubV1GtfsTripsSchema>;
