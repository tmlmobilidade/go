/* * */

import { z } from 'zod';

/* * */

export const ConditionStatusValues = [
	'not_applicable',
	'unknown',
	'missing',
	'damaged',
	'ok',
] as const;

export const ConditionStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(ConditionStatusValues));

export type ConditionStatus = z.infer<typeof ConditionStatusSchema>;
