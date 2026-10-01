/* * */

import { z } from 'zod';

/* * */

export const AvailabilityStatusValues = [
	'available',
	'unavailable',
	'unknown',
] as const;

export const AvailabilityStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(AvailabilityStatusValues));

export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;
