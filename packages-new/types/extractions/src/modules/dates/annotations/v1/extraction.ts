import { z } from 'zod';

import { ExtractionBaseSchema } from '../../../../shared/base.js';
import { DatesAnnotationsV1ExtractionCreateSchema } from './create.js';

/* * */

export const DatesAnnotationsV1ExtractionSchema = ExtractionBaseSchema.merge(DatesAnnotationsV1ExtractionCreateSchema);

export type DatesAnnotationsV1Extraction = z.infer<typeof DatesAnnotationsV1ExtractionSchema>;
