/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OperationRidesV3ExtractionPropertiesSchema } from './properties.js';
import { OperationRidesV3ExtractionVersionSchema } from './version.js';

/* * */

export const OperationRidesV3ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OperationRidesV3ExtractionPropertiesSchema,
	version: OperationRidesV3ExtractionVersionSchema,
});

export type OperationRidesV3ExtractionCreate = z.infer<typeof OperationRidesV3ExtractionCreateSchema>;
