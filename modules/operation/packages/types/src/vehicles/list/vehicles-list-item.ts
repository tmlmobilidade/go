/* * */

import { vehicleSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const VehiclesListItemSchema = vehicleSchema.pick({
	_id: true,
	emission: true,
	flags: true,
	propulsion: true,
	registration_date: true,
	vehicle_type: true,
});

/**
 * A read model for the vehicle list item.
 */
export type VehiclesListItem = z.infer<typeof VehiclesListItemSchema>;
