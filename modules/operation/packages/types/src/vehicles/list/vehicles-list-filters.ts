/* * */

import { VehicleEmissionSchema, VehiclePropulsionSchema, VehicleTypeSchema } from '@tmlmobilidade/go-types-operation';
import { OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const VehiclesListFiltersSchema = z.object({

	agency_ids: z.array(z.string()).default([]),

	emission: z.array(VehicleEmissionSchema).default([]),

	propulsion: z.array(VehiclePropulsionSchema).default([]),

	registration_date: z.array(OperationalDateSchema).default([]),

	vehicle_type: z.array(VehicleTypeSchema).default([]),

});

/**
 * The filters schema for listing vehicles.
 * It is intended for use in the vehicles module.
 */
export type VehiclesListFilters = z.infer<typeof VehiclesListFiltersSchema>;
