/* * */

import { z } from 'zod';

/* * */

export const InfrastructureNodesV1ExtractionPropertiesSchema = z.object({
	municipality_ids: z.array(z.string()).optional(),
});

export type InfrastructureNodesV1ExtractionProperties = z.infer<typeof InfrastructureNodesV1ExtractionPropertiesSchema>;
