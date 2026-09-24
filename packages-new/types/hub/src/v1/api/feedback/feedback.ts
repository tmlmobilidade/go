/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { type PublicFeedbackEntityType, PublicFeedbackEntityTypeSchema } from './entity-type.js';
import { PublicFeedbackMoodSchema } from './mood.js';
import { getPublicFeedbackReasonValuesByEntity, type PublicFeedbackReason, PublicFeedbackReasonSchema } from './reason.js';

/* * */

export const PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT = 4;

const PublicFeedbackSubmissionBaseSchema = z.object({
	entity_id: z.string().min(1),
	mood: PublicFeedbackMoodSchema,
	reasons: z.array(PublicFeedbackReasonSchema).max(PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT),
	schema_version: z.literal('v1').default('v1'),
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

interface PublicFeedbackReasonSelection {
	entity_type: PublicFeedbackEntityType
	reasons: PublicFeedbackReason[]
}

function validateReasonsForEntity(feedback: PublicFeedbackReasonSelection, context: z.RefinementCtx) {
	const allowedReasons = new Set(getPublicFeedbackReasonValuesByEntity(feedback.entity_type));
	const selectedReasons = new Set();

	feedback.reasons.forEach((reason, index) => {
		if (!allowedReasons.has(reason)) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Reason '${reason}' is not valid for ${feedback.entity_type} feedback.`,
				path: ['reasons', index],
			});
		}

		if (selectedReasons.has(reason)) {
			context.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Reason '${reason}' cannot be selected more than once.`,
				path: ['reasons', index],
			});
		}

		selectedReasons.add(reason);
	});
}

export const PublicFeedbackSubmissionSchema = PublicFeedbackSubmissionUnionSchema.superRefine(validateReasonsForEntity);

export const PublicFeedbackSchema = z.discriminatedUnion('entity_type', [
	PublicLineFeedbackSubmissionSchema.extend({ created_at: UnixMillisecondsSchema }),
	PublicStopFeedbackSubmissionSchema.omit({ agency_id: true }).extend({
		agency_id: z.null(),
		created_at: UnixMillisecondsSchema,
	}),
])
	.superRefine(validateReasonsForEntity);

/* * */

export type PublicFeedback = z.infer<typeof PublicFeedbackSchema>;
export type PublicFeedbackSubmission = z.infer<typeof PublicFeedbackSubmissionSchema>;
