/* * */

import { GtfsStopsSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const GtfsStrictV29StopsSchema = GtfsStopsSchema;

/**
 * Represents a stop in the GTFS format.
 * A stop is a physical location where passengers can board or alight from a transit vehicle.
 * It includes information such as the stop ID, name, location, and type of service.
 */
export type GtfsStrictV29Stops = z.infer<typeof GtfsStrictV29StopsSchema>;
