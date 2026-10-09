/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OperationPostersV1ExtractionPropertiesSchema } from './properties.js';
import { OperationPostersV1ExtractionVersionSchema } from './version.js';

/* * */

export const OperationPostersV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OperationPostersV1ExtractionPropertiesSchema,
	version: OperationPostersV1ExtractionVersionSchema,
});

export type OperationPostersV1ExtractionCreate = z.infer<typeof OperationPostersV1ExtractionCreateSchema>;
