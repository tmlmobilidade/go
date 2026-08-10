/* * */

import { z } from 'zod';

/* * */

export const GetAllAlertsQuerySchema = z.object({
	realtime: z.preprocess(
		(val: string) => val === 'true' || val === '1',
		z.boolean(),
	),
});

export type GetAllAlertsQuery = z.infer<typeof GetAllAlertsQuerySchema>;
