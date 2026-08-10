/* * */

import { z } from 'zod';

/* * */

export const GtfsRtVehicleStopStatusValues = [
	'INCOMING_AT',
	'STOPPED_AT',
	'IN_TRANSIT_TO',
] as const;

export const GtfsRtVehicleStopStatusSchema = z.enum(GtfsRtVehicleStopStatusValues);

export type GtfsRtVehicleStopStatus = z.infer<typeof GtfsRtVehicleStopStatusSchema>;
