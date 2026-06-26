/* * */

import { GtfsRtOccupancyStatusSchema } from '@/shared/occupancy-status.js';
import { GtfsRtTripDescriptorSchema } from '@/shared/trip-descriptor.js';
import { GtfsRtVehicleDescriptorSchema } from '@/shared/vehicle-descriptor.js';
import { GtfsRtCarriageDetailsSchema } from '@/vehicle-position/carriage-details.js';
import { GtfsRtCongestionLevelSchema } from '@/vehicle-position/congestion-level.js';
import { GtfsRtPositionSchema } from '@/vehicle-position/position.js';
import { GtfsRtVehicleStopStatusSchema } from '@/vehicle-position/vehicle-stop-status.js';
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
