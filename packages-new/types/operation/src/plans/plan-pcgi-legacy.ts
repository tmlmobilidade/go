/* * */

import { z } from 'zod';

/* * */

export const PlanPcgiLegacySchema = z.object({
	operation_plan_id: z.string().nullable(),
});
