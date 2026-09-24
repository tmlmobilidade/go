/* * */

import { z } from 'zod';

/* * */

export const PublicFeedbackMoodValues = ['happy', 'unhappy'] as const;

export const PublicFeedbackMoodSchema = z.enum(PublicFeedbackMoodValues);

export type PublicFeedbackMood = z.infer<typeof PublicFeedbackMoodSchema>;
