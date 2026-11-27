/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PublicFeedbackCommentSchema, PublicLineFeedbackSubmissionSchema, PublicStopFeedbackSubmissionSchema } from './submission-payload.js';
import { validateReasonsForEntity } from './validate-reasons.js';

/* * */

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
