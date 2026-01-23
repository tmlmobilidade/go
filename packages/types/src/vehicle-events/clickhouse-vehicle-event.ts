/* * */

import { ExtendedPositionSchema, operationalDateSchema } from '@/_common/index.js';
import { z } from 'zod';

import { SimplifiedVehicleEventSchema } from './simplified-vehicle-event.js';

/* * */

export const ClickHouseVehicleEventSchema = SimplifiedVehicleEventSchema.omit({ position: true }).extend({
	hour: z.number().min(0).max(23),
	operational_date: operationalDateSchema,
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
