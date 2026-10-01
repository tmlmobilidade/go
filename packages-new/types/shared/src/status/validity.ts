/* * */

import { z } from 'zod';

/* * */

export const ValidityStatusValues = [
	'valid',
	'invalid',
	'unknown',
] as const;

export const ValidityStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(ValidityStatusValues));

export type ValidityStatus = z.infer<typeof ValidityStatusSchema>;
