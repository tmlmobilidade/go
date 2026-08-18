/* * */

import { z } from 'zod';

/* * */

export const PerformanceNetworkAgencySchema = z.object({
	_id: z.string(),
	code: z.string(),
	metric_ids: z.string().array().min(1),
	name: z.string(),
	public_name: z.string(),
	short_name: z.string(),
});

/* * */

export type PerformanceNetworkAgency = z.infer<typeof PerformanceNetworkAgencySchema>;
