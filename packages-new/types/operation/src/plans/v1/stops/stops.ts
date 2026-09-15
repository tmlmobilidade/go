/* * */

import { GtfsStopsSchema } from '@tmlmobilidade/go-types-gtfs';
import { z } from 'zod';

/* * */

export const OperationPostersV1StopsSchema = z.object({
	location_type: GtfsStopsSchema.shape.location_type,
	parent_station: GtfsStopsSchema.shape.parent_station,
	platform_code: GtfsStopsSchema.shape.platform_code,
	stop_code: GtfsStopsSchema.shape.stop_code,
	stop_id: GtfsStopsSchema.shape.stop_id,
	stop_lat: GtfsStopsSchema.shape.stop_lat,
	stop_lon: GtfsStopsSchema.shape.stop_lon,
	stop_name: GtfsStopsSchema.shape.stop_name,
	wheelchair_boarding: GtfsStopsSchema.shape.wheelchair_boarding,
});

export type OperationPostersV1Stops = z.output<typeof OperationPostersV1StopsSchema>;
