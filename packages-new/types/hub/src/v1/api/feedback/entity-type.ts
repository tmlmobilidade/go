/* * */

import { z } from 'zod';

/* * */

export const PublicFeedbackEntityTypeValues = ['line', 'stop'] as const;

export const PublicFeedbackEntityTypeSchema = z.enum(PublicFeedbackEntityTypeValues);

export type PublicFeedbackEntityType = z.infer<typeof PublicFeedbackEntityTypeSchema>;
