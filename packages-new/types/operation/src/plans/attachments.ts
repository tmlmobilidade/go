/* * */

import { z } from 'zod';

/* * */

export const PlanAttachmentsSchema = z.object({
	apex_config: z.string().nullable().default(null),
	operation_gtfs: z.string().nullable().default(null),
	operation_gtfs_normalized: z.string().nullable().default(null),
}).default({});

export type PlanAttachments = z.infer<typeof PlanAttachmentsSchema>;
