/* * */

import { z } from 'zod';

/* * */

export const VehicleFlagSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
	vehicle_id: z.string(),
});

export type VehicleFlag = z.infer<typeof VehicleFlagSchema>;
