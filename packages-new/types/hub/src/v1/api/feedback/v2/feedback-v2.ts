/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { validationParams } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

import { type PublicFeedbackEntityType, PublicFeedbackEntityTypeSchema } from '../v1/entity-type.js';
import { PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT } from '../v1/feedback-v1.js';
import { PublicFeedbackMoodSchema } from '../v1/mood.js';
import { getPublicFeedbackV2ReasonValuesByEntity, type PublicFeedbackV2Reason, PublicFeedbackV2ReasonSchema } from './reason-v2.js';

/* * */

export const PUBLIC_FEEDBACK_V2_COMMENT_MAX_LENGTH = 50;

const PublicFeedbackCommentSchema = z.string().trim().max(PUBLIC_FEEDBACK_V2_COMMENT_MAX_LENGTH);

const PublicFeedbackSubmissionBaseSchema = z.object({
	comment: PublicFeedbackCommentSchema.optional(),
	entity_id: z.string().min(1),
	mood: PublicFeedbackMoodSchema,
	reasons: z.array(PublicFeedbackV2ReasonSchema).max(PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT),
	schema_version: z.literal('v2'),
});

const PublicLineFeedbackSubmissionSchema = PublicFeedbackSubmissionBaseSchema.extend({
	agency_id: z.string().min(1),
	entity_type: z.literal(PublicFeedbackEntityTypeSchema.enum.line),
});

const PublicStopFeedbackSubmissionSchema = PublicFeedbackSubmissionBaseSchema.extend({
	agency_id: z.never().optional(),
	entity_type: z.literal(PublicFeedbackEntityTypeSchema.enum.stop),
});

const PublicFeedbackSubmissionUnionSchema = z.discriminatedUnion('entity_type', [
	PublicLineFeedbackSubmissionSchema,
	PublicStopFeedbackSubmissionSchema,
]);

interface PublicFeedbackV2ReasonSelection {
	entity_type: PublicFeedbackEntityType
	reasons: PublicFeedbackV2Reason[]
}

function validateReasonsForEntity(feedback: PublicFeedbackV2ReasonSelection, context: z.RefinementCtx) {
	const allowedReasons = new Set(getPublicFeedbackV2ReasonValuesByEntity(feedback.entity_type));
	const selectedReasons = new Set<PublicFeedbackV2Reason>();

	feedback.reasons.forEach((reason, index) => {
		if (!allowedReasons.has(reason)) {
			context.addIssue({
				code: 'custom',
				...validationParams('custom.feedback.reason', { entity: feedback.entity_type, reason }),
				path: ['reasons', index],
			});
		}

		if (selectedReasons.has(reason)) {
			context.addIssue({
				code: 'custom',
				...validationParams('custom.feedback.duplicate_reason', { reason }),
				path: ['reasons', index],
			});
		}

		selectedReasons.add(reason);
	});
}

export const PublicFeedbackV2SubmissionSchema = PublicFeedbackSubmissionUnionSchema.superRefine(validateReasonsForEntity);

export const PublicFeedbackV2Schema = z.discriminatedUnion('entity_type', [
	PublicLineFeedbackSubmissionSchema.extend({
		comment: PublicFeedbackCommentSchema.nullable().default(null),
		created_at: UnixMillisecondsSchema,
	}),
	PublicStopFeedbackSubmissionSchema.omit({ agency_id: true }).extend({
		agency_id: z.null(),
		comment: PublicFeedbackCommentSchema.nullable().default(null),
		created_at: UnixMillisecondsSchema,
	}),
])
	.superRefine(validateReasonsForEntity);

/* * */

export type PublicFeedbackV2 = z.infer<typeof PublicFeedbackV2Schema>;
export type PublicFeedbackV2Submission = z.infer<typeof PublicFeedbackV2SubmissionSchema>;
