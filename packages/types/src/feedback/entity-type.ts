/* * */

import { z } from 'zod';

/* * */

export const PublicFeedbackEntityTypeSchemaValues = [
	'line',
	'stop',
] as const;

/* * */

export const PublicFeedbackEntityTypeSchema = z.enum(PublicFeedbackEntityTypeSchemaValues);
