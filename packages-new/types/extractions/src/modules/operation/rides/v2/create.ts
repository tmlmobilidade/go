/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OperationRidesV2ExtractionPropertiesSchema } from './properties.js';
import { OperationRidesV2ExtractionVersionSchema } from './version.js';

/* * */

export const OperationRidesV2ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OperationRidesV2ExtractionPropertiesSchema,
	version: OperationRidesV2ExtractionVersionSchema,
});

export type OperationRidesV2ExtractionCreate = z.infer<typeof OperationRidesV2ExtractionCreateSchema>;
