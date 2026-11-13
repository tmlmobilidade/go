/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OperationPostersV1ExtractionCreateSchema } from './create.js';

/* * */

export const OperationPostersV1ExtractionSchema = ExtractionBaseSchema
	.merge(OperationPostersV1ExtractionCreateSchema);

export type OperationPostersV1Extraction = z.infer<typeof OperationPostersV1ExtractionSchema>;
