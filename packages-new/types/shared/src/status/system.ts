/* * */

import { z } from 'zod';

/**
 * @deprecated Use ProcessingStatusValues instead
 */
export const SystemStatusValues = [
	'waiting',
	'incomplete',
	'complete',
	'error',
] as const;

/**
 * @deprecated Use ProcessingStatusSchema instead
 */
export const SystemStatusSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(SystemStatusValues));

/**
 * @deprecated Use ProcessingStatus instead
 */
export type SystemStatus = z.infer<typeof SystemStatusSchema>;
