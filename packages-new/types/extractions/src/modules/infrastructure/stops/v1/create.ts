/* * */

import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { InfrastructureStopsV1ExtractionPropertiesSchema } from './properties.js';
import { InfrastructureStopsV1ExtractionVersionSchema } from './version.js';

/* * */

export const InfrastructureStopsV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: InfrastructureStopsV1ExtractionPropertiesSchema,
	version: InfrastructureStopsV1ExtractionVersionSchema,
});

export type InfrastructureStopsV1ExtractionCreate = z.infer<typeof InfrastructureStopsV1ExtractionCreateSchema>;
