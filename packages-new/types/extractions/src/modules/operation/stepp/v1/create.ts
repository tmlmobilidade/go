/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { OperationGtfsSteppV1ExtractionPropertiesSchema } from './properties.js';
import { OperationGtfsSteppV1ExtractionVersionSchema } from './version.js';

/* * */

export const OperationGtfsSteppV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: OperationGtfsSteppV1ExtractionPropertiesSchema,
	version: OperationGtfsSteppV1ExtractionVersionSchema,
});

export type OperationGtfsSteppV1ExtractionCreate = z.infer<typeof OperationGtfsSteppV1ExtractionCreateSchema>;
