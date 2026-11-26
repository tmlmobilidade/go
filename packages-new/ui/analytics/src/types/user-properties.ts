/* * */

import { z } from 'zod';

/* * */

export const AnalyticsUserProperties = z.object({
	_id: z.string(),
	email: z.string(),
	name: z.string(),
});

/* * */

export type AnalyticsUserProperties = z.infer<typeof AnalyticsUserProperties>;
