/* * */

import { z } from 'zod';

/* * */

export const TemporalStatusValues = [
	'active',
	'expired',
	'upcoming',
] as const;

export const TemporalStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(TemporalStatusValues));

export type TemporalStatus = z.infer<typeof TemporalStatusSchema>;

/* * */

export const TemporalStatusFilterValues = [...TemporalStatusValues, 'none'] as const;

export const TemporalStatusFilterSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(TemporalStatusFilterValues));

export type TemporalStatusFilter = z.infer<typeof TemporalStatusFilterSchema>;
