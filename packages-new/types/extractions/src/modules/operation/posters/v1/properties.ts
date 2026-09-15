/* * */

import { z } from 'zod';

/* * */

export const OperationPostersV1ExtractionPropertiesSchema = z.object({

	agency_ids: z
		.array(z.string())
		.default([]),

	plan_ids: z
		.array(z.string())
		.default([]),
});

export type OperationPostersV1ExtractionProperties = z.infer<typeof OperationPostersV1ExtractionPropertiesSchema>;
