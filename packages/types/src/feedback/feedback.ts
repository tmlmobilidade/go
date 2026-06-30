/* * */

import { UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PublicFeedbackEntityTypeSchemaValues } from './entity-type.js';
import { PublicFeedbackMoodSchemaValues } from './feedback-mood.js';

/* * */

export const PublicFeedbackSchema = z.object({
	agency_id: z.string().min(1),
	created_at: UnixTimestampSchema,
	entity_id: z.string().min(1),
	entity_type: z.enum(PublicFeedbackEntityTypeSchemaValues),
	mood: z.enum(PublicFeedbackMoodSchemaValues),
	reasons: z.array(z.string().min(1)).max(4),
	schema_version: z.literal('v1').default('v1'),
});

/* * */

export type PublicFeedback = z.infer<typeof PublicFeedbackSchema>;
