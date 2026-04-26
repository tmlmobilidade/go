/* * */

import { OperationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

/* * */

export const OperationLineSchema = z.object({
	agency_id: z.string(),
	hashed_trip_ids: z.array(z.string()),
	last_operational_date: OperationalDateSchema,
	last_plan_id: z.string(),
	line_id: z.number(),
	line_long_name: z.string(),
	line_short_name: z.string(),
	pattern_ids: z.array(z.string()).default([]),
	route_color: z.string(),
	route_ids: z.array(z.string()).default([]),
	stop_ids: z.array(z.string()).default([]),
});

export type OperationLine = z.infer<typeof OperationLineSchema>;
