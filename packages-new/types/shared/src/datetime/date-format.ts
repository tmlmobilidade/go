/* * */

import { z } from 'zod';

/* * */

export const DateFormatValues = [
	'full',
	'short',
	'only_time',
	'only_time_with_seconds',
	'only_date',
	'iso',
] as const;

export const DateFormatSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(DateFormatValues));

/**
 * A date format.
 */
export type DateFormat = z.infer<typeof DateFormatSchema>;
