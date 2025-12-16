/* * */

import { z } from 'zod';

/* * */

export const StopJurisdictionValues = [
	'ip',
	'municipality',
	'other',
	'unknown',
] as const;

export const StopJurisdictionSchema = z.enum(StopJurisdictionValues);

export type StopJurisdiction = z.infer<typeof StopJurisdictionSchema>;
