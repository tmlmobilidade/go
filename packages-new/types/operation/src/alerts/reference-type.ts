/* * */

import { z } from 'zod';

/* * */

export const AlertReferenceTypeValues = [
	'agency',
	'lines',
	'stops',
	'rides',
] as const;

export const AlertReferenceTypeSchema = z.enum(AlertReferenceTypeValues);

export type AlertReferenceType = z.infer<typeof AlertReferenceTypeSchema>;
