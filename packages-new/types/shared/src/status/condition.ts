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

export const ConditionStatusSchema = z.enum(ConditionStatusValues);

export type ConditionStatus = z.infer<typeof ConditionStatusSchema>;
