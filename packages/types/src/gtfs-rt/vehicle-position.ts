/* * */

import { GtfsRtCarriageDetailsSchema } from '@/gtfs-rt/carriage-details.js';
import { GtfsRtCongestionLevelSchema } from '@/gtfs-rt/congestion-level.js';
import { GtfsRtOccupancyStatusSchema } from '@/gtfs-rt/occupancy-status.js';
import { GtfsRtPositionSchema } from '@/gtfs-rt/position.js';
import { GtfsRtTripDescriptorSchema } from '@/gtfs-rt/trip-descriptor.js';
import { GtfsRtVehicleDescriptorSchema } from '@/gtfs-rt/vehicle-descriptor.js';
import { GtfsRtVehicleStopStatusSchema } from '@/gtfs-rt/vehicle-stop-status.js';
import { z } from 'zod';

/* * */

export const GtfsRtVehiclePositionSchema = z.object({
	congestion_level: GtfsRtCongestionLevelSchema.nullish(),
	current_status: GtfsRtVehicleStopStatusSchema.nullish(),
	current_stop_sequence: z.number().nullish(),
	multi_carriage_details: GtfsRtCarriageDetailsSchema.array().nullish(),
	occupancy_percentage: z.number().nullish(),
	occupancy_status: GtfsRtOccupancyStatusSchema.nullish(),
	position: GtfsRtPositionSchema,
	stop_id: z.string().nullish(),
	timestamp: z.number().nullish(),
	trip: GtfsRtTripDescriptorSchema,
	vehicle: GtfsRtVehicleDescriptorSchema,
});

export type GtfsRtVehiclePosition = z.infer<typeof GtfsRtVehiclePositionSchema>;
