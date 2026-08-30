/* * */

import { z } from 'zod';

/* * */

export const ActivityStatusValues = [
	'active',
	'expired',
	'upcoming',
] as const;

export const ActivityStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(ActivityStatusValues));

export type ActivityStatus = z.infer<typeof ActivityStatusSchema>;

/* * */

export const ActivityStatusFilterValues = [...ActivityStatusValues, 'none'] as const;

export const ActivityStatusFilterSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(ActivityStatusFilterValues));

export type ActivityStatusFilter = z.infer<typeof ActivityStatusFilterSchema>;
