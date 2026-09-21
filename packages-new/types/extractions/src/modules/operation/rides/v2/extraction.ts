/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OperationRidesV2ExtractionCreateSchema } from './create.js';

/* * */

export const OperationRidesV2ExtractionSchema = ExtractionBaseSchema
	.merge(OperationRidesV2ExtractionCreateSchema);

export type OperationRidesV2Extraction = z.infer<typeof OperationRidesV2ExtractionSchema>;
