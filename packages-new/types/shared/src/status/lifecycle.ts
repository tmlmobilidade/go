/* * */

import { z } from 'zod';

/* * */

export const LifecycleStatusValues = [
	'draft',
	'active',
	'inactive',
	'provisional',
	'seasonal',
	'voided',
] as const;

export const LifecycleStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(LifecycleStatusValues));

export type LifecycleStatus = z.infer<typeof LifecycleStatusSchema>;
