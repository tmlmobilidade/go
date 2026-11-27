/* * */

import { UnixMillisecondsSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { PublicLineFeedbackSubmissionSchema, PublicStopFeedbackSubmissionSchema } from './submission-payload.js';
import { validateReasonsForEntity } from './validate-reasons.js';

/* * */

export const PublicFeedbackV1Schema = z.discriminatedUnion('entity_type', [
	PublicLineFeedbackSubmissionSchema.extend({ created_at: UnixMillisecondsSchema }),
	PublicStopFeedbackSubmissionSchema.omit({ agency_id: true }).extend({
		agency_id: z.null(),
		created_at: UnixMillisecondsSchema,
	}),
])
	.superRefine(validateReasonsForEntity);

/* * */

export type PublicFeedbackV1 = z.infer<typeof PublicFeedbackV1Schema>;
