/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OperationRidesV1ExtractionPropertiesSchema } from './properties.js';
import { OperationRidesV1ExtractionVersionSchema } from './version.js';

/* * */

export const OperationRidesV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OperationRidesV1ExtractionPropertiesSchema,
	version: OperationRidesV1ExtractionVersionSchema,
});

export type OperationRidesV1ExtractionCreate = z.infer<typeof OperationRidesV1ExtractionCreateSchema>;
