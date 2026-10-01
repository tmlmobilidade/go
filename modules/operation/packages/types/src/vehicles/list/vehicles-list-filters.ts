/* * */

import { z } from 'zod';

/* * */

export const VehiclesListFiltersSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

});

/**
 * The filters schema for listing vehicles.
 * It is intended for use in the vehicles module.
 */
export type VehiclesListFilters = z.infer<typeof VehiclesListFiltersSchema>;
