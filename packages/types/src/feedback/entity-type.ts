/* * */

import { z } from 'zod';

/* * */

export const PublicFeedbackEntityTypeSchemaValues = [
	'line',
	'stop',
] as const;

/* * */

export type PublicFeedbackEntityType = typeof PublicFeedbackEntityTypeSchemaValues[number];

/* * */

export const PublicFeedbackEntityTypeSchema = z.enum(PublicFeedbackEntityTypeSchemaValues);
