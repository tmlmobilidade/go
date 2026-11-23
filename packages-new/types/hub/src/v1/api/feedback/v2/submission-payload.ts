/* * */

import { z } from 'zod';

import { PublicFeedbackEntityTypeSchema } from '../v1/entity-type.js';
import { PublicFeedbackMoodSchema } from '../v1/mood.js';
import { PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT } from '../v1/submission-payload.js';
import { PublicFeedbackV2ReasonSchema } from './reason.js';
import { validateReasonsForEntity } from './validate-reasons.js';

/* * */

export const PUBLIC_FEEDBACK_V2_COMMENT_MAX_LENGTH = 50;

export const PublicFeedbackCommentSchema = z.string().trim().max(PUBLIC_FEEDBACK_V2_COMMENT_MAX_LENGTH);

const PublicFeedbackSubmissionBaseSchema = z.object({
	comment: PublicFeedbackCommentSchema.optional(),
	entity_id: z.string().min(1),
	mood: PublicFeedbackMoodSchema,
	reasons: z.array(PublicFeedbackV2ReasonSchema).max(PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT),
	schema_version: z.literal('v2'),
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

export const PublicFeedbackV2SubmissionSchema = PublicFeedbackSubmissionUnionSchema.superRefine(validateReasonsForEntity);

/* * */

export type PublicFeedbackV2Submission = z.infer<typeof PublicFeedbackV2SubmissionSchema>;
