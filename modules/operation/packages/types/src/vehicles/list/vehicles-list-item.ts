/* * */

import { vehicleSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const VehiclesListItemSchema = vehicleSchema.omit({
	created_at: true,
	created_by: true,
	updated_at: true,
	updated_by: true,
});

/**
 * A read model for the vehicle list item.
 */
export type VehiclesListItem = z.infer<typeof VehiclesListItemSchema>;
