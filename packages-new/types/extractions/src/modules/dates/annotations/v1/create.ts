import { z } from 'zod';

import { ExtractionBaseCreateSchema } from '../../../../shared/base-create.js';
import { DatesAnnotationsV1ExtractionPropertiesSchema } from './properties.js';
import { DatesAnnotationsV1ExtractionVersionSchema } from './version.js';

/* * */

export const DatesAnnotationsV1ExtractionCreateSchema = ExtractionBaseCreateSchema.extend({
	properties: DatesAnnotationsV1ExtractionPropertiesSchema,
	version: DatesAnnotationsV1ExtractionVersionSchema,
});

export type DatesAnnotationsV1ExtractionCreate = z.infer<typeof DatesAnnotationsV1ExtractionCreateSchema>;
