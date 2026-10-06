/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { InfrastructureNodesV1ExtractionPropertiesSchema } from './properties.js';
import { InfrastructureNodesV1ExtractionVersionSchema } from './version.js';

/* * */

export const InfrastructureNodesV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: InfrastructureNodesV1ExtractionPropertiesSchema,
	version: InfrastructureNodesV1ExtractionVersionSchema,
});

export type InfrastructureNodesV1ExtractionCreate = z.infer<typeof InfrastructureNodesV1ExtractionCreateSchema>;
