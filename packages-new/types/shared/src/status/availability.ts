/* * */

import { z } from 'zod';

/* * */

export const AvailabilityStatusValues = [
	'available',
	'unavailable',
	'unknown',
] as const;

export const AvailabilityStatusSchema = z.enum(AvailabilityStatusValues);

export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;
