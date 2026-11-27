/* * */

import { z } from 'zod';

import { PublicFeedbackEntityTypeSchema } from './entity-type.js';
import { PublicFeedbackMoodSchema } from './mood.js';
import { PublicFeedbackReasonSchema } from './reason.js';
import { validateReasonsForEntity } from './validate-reasons.js';

/* * */

export const PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT = 4;

const PublicFeedbackSubmissionBaseSchema = z.object({
	entity_id: z.string().min(1),
	mood: PublicFeedbackMoodSchema,
	reasons: z.array(PublicFeedbackReasonSchema).max(PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT),
	schema_version: z.literal('v1').default('v1'),
});

export const PublicLineFeedbackSubmissionSchema = PublicFeedbackSubmissionBaseSchema.extend({
	agency_id: z.string().min(1),
	entity_type: z.literal(PublicFeedbackEntityTypeSchema.enum.line),
});

export const PublicStopFeedbackSubmissionSchema = PublicFeedbackSubmissionBaseSchema.extend({
	agency_id: z.never().optional(),
	entity_type: z.literal(PublicFeedbackEntityTypeSchema.enum.stop),
});

const PublicFeedbackSubmissionUnionSchema = z.discriminatedUnion('entity_type', [
	PublicLineFeedbackSubmissionSchema,
	PublicStopFeedbackSubmissionSchema,
]);

export const PublicFeedbackV1SubmissionSchema = PublicFeedbackSubmissionUnionSchema.superRefine(validateReasonsForEntity);

/* * */

export type PublicFeedbackV1Submission = z.infer<typeof PublicFeedbackV1SubmissionSchema>;
