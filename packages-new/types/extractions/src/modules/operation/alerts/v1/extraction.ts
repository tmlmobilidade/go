/* * */

import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { OperationAlertsV1ExtractionCreateSchema } from './create.js';

/* * */

export const OperationAlertsV1ExtractionSchema = ExtractionBaseSchema
	.merge(OperationAlertsV1ExtractionCreateSchema);

export type OperationAlertsV1Extraction = z.infer<typeof OperationAlertsV1ExtractionSchema>;
