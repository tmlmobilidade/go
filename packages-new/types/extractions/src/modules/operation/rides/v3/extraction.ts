/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OperationRidesV3ExtractionCreateSchema } from './create.js';

/* * */

export const OperationRidesV3ExtractionSchema = ExtractionBaseSchema
	.merge(OperationRidesV3ExtractionCreateSchema);

export type OperationRidesV3Extraction = z.infer<typeof OperationRidesV3ExtractionSchema>;
