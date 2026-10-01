/* * */

import { RideAnalysisBaseSchema } from '@/ride-analyses/ride-analysis-base.js';
import { NonNegativeIntegerSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RideAnalysisMatchingVehicleIdsSchema = RideAnalysisBaseSchema.extend({
	extra_apex_vehicle_ids_qty: NonNegativeIntegerSchema.nullable().default(null),
	extra_vehicle_events_vehicle_ids_qty: NonNegativeIntegerSchema.nullable().default(null),
	matching_vehicle_ids_qty: NonNegativeIntegerSchema.nullable().default(null),
	reason: z.enum(['MATCHING_VEHICLE_IDS', 'VEHICLE_ID_MISMATCH', 'NO_VEHICLE_EVENTS', 'NO_APEX_TRANSACTIONS']).nullable().default(null),
	total_vehicle_ids_qty: NonNegativeIntegerSchema.nullable().default(null),
});

/**
 * Tests whether the vehicle IDs from the vehicle events match with those from the APEX transactions.
 * @param extra_apex_vehicle_ids_qty The number of unique vehicle IDs found in the APEX transactions missing from the vehicle events.
 * @param extra_vehicle_events_vehicle_ids_qty The number of unique vehicle IDs found in the vehicle events missing from the APEX transactions.
 * @param matching_vehicle_ids_qty The number of vehicle IDs that match between the APEX transactions and the vehicle events.
 * @param total_vehicle_ids_qty The total number of unique vehicle IDs found in the APEX transactions and the vehicle events.
 */
export type RideAnalysisMatchingVehicleIds = z.infer<typeof RideAnalysisMatchingVehicleIdsSchema>;
