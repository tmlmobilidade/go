/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OperationAlertsV1ExtractionPropertiesSchema } from './properties.js';
import { OperationAlertsV1ExtractionVersionSchema } from './version.js';

/* * */

export const OperationAlertsV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OperationAlertsV1ExtractionPropertiesSchema,
	version: OperationAlertsV1ExtractionVersionSchema,
});

export type OperationAlertsV1ExtractionCreate = z.infer<typeof OperationAlertsV1ExtractionCreateSchema>;
