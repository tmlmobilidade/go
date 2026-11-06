/* * */

import { PatternSimplifiedSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

export const StopsPatternsResponseSchema = z.array(PatternSimplifiedSchema);

export type StopsPatternsResponse = z.infer<typeof StopsPatternsResponseSchema>;
