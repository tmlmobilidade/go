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

export const SeverityStatusSchema = z.enum(SeverityStatusValues);

export type SeverityStatus = z.infer<typeof SeverityStatusSchema>;
