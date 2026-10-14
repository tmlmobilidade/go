/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { InfrastructureNodesV1ExtractionCreateSchema } from './create.js';

/* * */

export const InfrastructureNodesV1ExtractionSchema = ExtractionBaseSchema
	.merge(InfrastructureNodesV1ExtractionCreateSchema);

export type InfrastructureNodesV1Extraction = z.infer<typeof InfrastructureNodesV1ExtractionSchema>;
