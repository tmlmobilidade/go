/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OperationRidesV1ExtractionCreateSchema } from './create.js';

/* * */

export const OperationRidesV1ExtractionSchema = ExtractionBaseSchema
	.merge(OperationRidesV1ExtractionCreateSchema);

export type OperationRidesV1Extraction = z.infer<typeof OperationRidesV1ExtractionSchema>;
