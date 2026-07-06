/* * */

import { z } from 'zod';

/* * */

export const DelayStatusValues = [
	'ontime',
	'delayed',
	'early',
	'none',
] as const;

export const DelayStatusSchema = z.enum(DelayStatusValues);

export type DelayStatus = z.infer<typeof DelayStatusSchema>;
