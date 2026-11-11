/* * */

import { PatternSimplifiedSchema } from '@tmlmobilidade/go-types-offer';
import { z } from 'zod';

/* * */

export const EventsPatternsResponseSchema = z.array(PatternSimplifiedSchema);

export type EventsPatternsResponse = z.infer<typeof EventsPatternsResponseSchema>;
