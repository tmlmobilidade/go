/* * */

import { z } from 'zod';

/* * */

export const GtfsRtDropOffPickupTypeValues = [
	'REGULAR',
	'NONE',
	'PHONE_AGENCY',
	'COORDINATE_WITH_DRIVER',
] as const;

export const GtfsRtDropOffPickupTypeSchema = z.enum(GtfsRtDropOffPickupTypeValues);

export type GtfsRtDropOffPickupType = z.infer<typeof GtfsRtDropOffPickupTypeSchema>;
