/* * */

import { z } from 'zod';

/* * */

export const DelayStatusValues = [
	'ontime',
	'delayed',
	'early',
] as const;

export const DelayStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(DelayStatusValues));

export type DelayStatus = z.infer<typeof DelayStatusSchema>;

/* * */

export const DelayStatusFilterValues = [...DelayStatusValues, 'none'] as const;

export const DelayStatusFilterSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(DelayStatusFilterValues));

export type DelayStatusFilter = z.infer<typeof DelayStatusFilterSchema>;
