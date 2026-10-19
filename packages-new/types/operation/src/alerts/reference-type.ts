/* * */

import { z } from 'zod';

/* * */

export const AlertReferenceTypeValues = [
	'agency',
	'lines',
	'stops',
	'rides',
] as const;

export const AlertReferenceTypeSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(AlertReferenceTypeValues));

export type AlertReferenceType = z.infer<typeof AlertReferenceTypeSchema>;
