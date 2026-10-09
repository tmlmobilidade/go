/* * */

import { z } from 'zod';

/* * */

export const InfrastructureNodesV1ExtractionVersionValue = 'infrastructure-nodes-v1';

export const InfrastructureNodesV1ExtractionVersionSchema = z.literal(InfrastructureNodesV1ExtractionVersionValue);

export type InfrastructureNodesV1ExtractionVersion = z.infer<typeof InfrastructureNodesV1ExtractionVersionSchema>;
