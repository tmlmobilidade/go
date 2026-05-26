/* * */

import { OperationalDateSchema } from '@/_common/operational-date.js';
import { HashedPatternSchema } from '@/operation/hashed-patterns/hashed-pattern.js';
import { z } from 'zod';

/* * */

export const OperationalStopSchema = z.object({
	agency_ids: z.array(z.string()).default([]),
	hashed_patterns: z.array(HashedPatternSchema).default([]),
	last_operational_date: OperationalDateSchema,
	last_plan_id: z.string(),
	line_ids: z.array(z.number()).default([]),
	pattern_ids: z.array(z.string()).default([]),
	route_ids: z.array(z.string()).default([]),
	stop_id: z.string(),
	stop_name: z.string(),
});

export type OperationalStop = z.infer<typeof OperationalStopSchema>;
