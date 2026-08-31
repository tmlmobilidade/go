/* * */

import { z } from 'zod';

/* * */

export const StopIdSchema = z
	.union([z.string(), z.number()])
	.transform(value => Number(value))
	.pipe(z.number().min(100_000).max(999_999))
	.transform(value => String(value));

/**
 * Represents a Stop ID, which is a unique identifier
 * for a stop in the transportation system.
 */
export type StopId = z.infer<typeof StopIdSchema>;
