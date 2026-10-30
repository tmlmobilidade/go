/* * */

import { z } from 'zod';

/* * */

export const AnalyticsUserProperties = z.object({
	_id: z.string().optional(),
	email: z.string().email().optional(),
	name: z.string().optional(),
});

/* * */

export type AnalyticsUserProperties = z.infer<typeof AnalyticsUserProperties>;
