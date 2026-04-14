/* * */

import { z } from 'zod';

/* * */

export const StopIdSchema = z
	.number()
	.min(100_000)
	.max(999_999);

export type StopId = z.infer<typeof StopIdSchema>;
