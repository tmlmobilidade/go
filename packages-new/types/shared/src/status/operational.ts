/* * */

import { z } from 'zod';

/* * */

export const OperationalStatusValues = [
	'ended',
	'missed',
	'running',
	'scheduled',
] as const;

export const OperationalStatusSchema = z.enum(OperationalStatusValues);

export type OperationalStatus = z.infer<typeof OperationalStatusSchema>;
