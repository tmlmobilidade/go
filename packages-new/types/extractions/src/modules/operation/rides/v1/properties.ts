/* * */

import { z } from 'zod';

/* * */

export const OperationRidesV1ExtractionPropertiesSchema = z.object({
	municipality_ids: z.array(z.string()).optional(),
});

export type OperationRidesV1ExtractionProperties = z.infer<typeof OperationRidesV1ExtractionPropertiesSchema>;
