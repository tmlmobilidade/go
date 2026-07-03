/* * */

import { z } from 'zod';

/* * */

export const SystemStatusValues = [
	'waiting',
	'incomplete',
	'complete',
	'error',
] as const;

export const SystemStatusSchema = z.enum(SystemStatusValues);

export type SystemStatus = z.infer<typeof SystemStatusSchema>;
