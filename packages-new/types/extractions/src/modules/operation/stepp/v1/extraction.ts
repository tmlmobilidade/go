/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OperationGtfsSteppV1ExtractionCreateSchema } from './create.js';

/* * */

export const OperationGtfsSteppV1ExtractionSchema = ExtractionBaseSchema
	.merge(OperationGtfsSteppV1ExtractionCreateSchema);

export type OperationGtfsSteppV1Extraction = z.infer<typeof OperationGtfsSteppV1ExtractionSchema>;
