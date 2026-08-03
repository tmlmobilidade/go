/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/analysis-base.js';
import { NonNegativeNumberSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisMatchingVehicleIdsSchema = RideAnalysisBaseSchema.extend({
	extra_apex_vehicle_ids_qty: NonNegativeNumberSchema.nullable(),
	extra_vehicle_events_vehicle_ids_qty: NonNegativeNumberSchema.nullable(),
	matching_vehicle_ids_qty: NonNegativeNumberSchema.nullable(),
	reason: z.enum(['MATCHING_VEHICLE_IDS', 'VEHICLE_ID_MISMATCH', 'NO_VEHICLE_EVENTS', 'NO_APEX_TRANSACTIONS']).nullable(),
	total_vehicle_ids_qty: NonNegativeNumberSchema.nullable(),
});

/**
 * Tests whether the vehicle IDs from the vehicle events match with those from the APEX transactions.
 * @param extra_apex_vehicle_ids_qty The number of unique vehicle IDs found in the APEX transactions missing from the vehicle events.
 * @param extra_vehicle_events_vehicle_ids_qty The number of unique vehicle IDs found in the vehicle events missing from the APEX transactions.
 * @param matching_vehicle_ids_qty The number of vehicle IDs that match between the APEX transactions and the vehicle events.
 * @param total_vehicle_ids_qty The total number of unique vehicle IDs found in the APEX transactions and the vehicle events.
 */
export type RideAnalysisMatchingVehicleIds = z.infer<typeof RideAnalysisMatchingVehicleIdsSchema>;
