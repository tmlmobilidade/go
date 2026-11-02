/* * */

import { z } from 'zod';

/* * */

export const SeverityStatusValues = [
	'ignore', // The rule is not enforced
	'info', // The rule is presented as information
	'warning', // The rule is enforced as a suggestion
	'error', // The rule is enforced as a requirement
] as const;

export const SeverityStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(SeverityStatusValues));

export type SeverityStatus = z.infer<typeof SeverityStatusSchema>;
