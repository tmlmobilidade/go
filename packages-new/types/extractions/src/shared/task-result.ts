/* * */

import { z } from 'zod';

/* * */

export const ExtractionTaskResultSchema = z.undefined();

export type ExtractionTaskResult = z.infer<typeof ExtractionTaskResultSchema>;
