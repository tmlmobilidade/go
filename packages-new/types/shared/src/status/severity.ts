/* * */

import { z } from 'zod';

/* * */

export const SeverityStatusValues = [
	'ignore',
	'info',
	'warning',
	'error',
	'forbidden',
] as const;

export const SeverityStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(SeverityStatusValues));

export type SeverityStatus = z.infer<typeof SeverityStatusSchema>;
