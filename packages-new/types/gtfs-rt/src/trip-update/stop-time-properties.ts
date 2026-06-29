/* * */

import { GtfsRtDropOffPickupTypeSchema } from '@/shared/drop-off-pickup-type.js';
import { z } from 'zod';

/* * */

export const GtfsRtStopTimePropertiesSchema = z.object({
	assigned_stop_id: z.string().nullish(),
	drop_off_type: GtfsRtDropOffPickupTypeSchema.nullish(),
	pickup_type: GtfsRtDropOffPickupTypeSchema.nullish(),
	stop_headsign: z.string().nullish(),
});

export type GtfsRtStopTimeProperties = z.infer<typeof GtfsRtStopTimePropertiesSchema>;
