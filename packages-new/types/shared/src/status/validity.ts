/* * */

import { z } from 'zod';

/* * */

export const ValidityStatusValues = [
	'valid',
	'invalid',
	'unknown',
] as const;

export const ValidityStatusSchema = z.enum(ValidityStatusValues);

export type ValidityStatus = z.infer<typeof ValidityStatusSchema>;
