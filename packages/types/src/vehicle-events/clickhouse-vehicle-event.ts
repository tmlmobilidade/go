/* * */

import { ExtendedPositionSchema, OperationalDateSchema } from '@/_common/index.js';
import { SimplifiedVehicleEventSchema } from '@/vehicle-events/simplified-vehicle-event.js';
import { z } from 'zod';

/* * */

export const ClickHouseVehicleEventSchema = SimplifiedVehicleEventSchema.extend({
	hour: z.number().min(0).max(23),
	operational_date: OperationalDateSchema,
	plan_id: z.string(),
	route_id: z.string(),
	...ExtendedPositionSchema.shape.geohash.shape,
	...ExtendedPositionSchema.shape.h3.shape,
});

/**
 * ClickHouse Vehicle Events are used to store vehicle events in ClickHouse.
 * They are based on the SimplifiedVehicleEventSchema but extended with additional fields
 * specific to ClickHouse.
 */
export type ClickHouseVehicleEvent = z.infer<typeof ClickHouseVehicleEventSchema>;
