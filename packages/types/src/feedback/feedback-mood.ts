/* * */

import { z } from 'zod';

/* * */

export const PublicFeedbackMoodSchemaValues = [
	'happy',
	'unhappy',
] as const;

/* * */
export const PublicFeedbackMoodSchema = z.enum(PublicFeedbackMoodSchemaValues);

