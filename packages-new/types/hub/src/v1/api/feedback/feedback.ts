/* * */

import { z } from 'zod';

import { PublicFeedbackV1Schema } from './v1/feedback.js';
import { PublicFeedbackV1SubmissionSchema } from './v1/submission-payload.js';
import { PublicFeedbackV2Schema } from './v2/feedback.js';
import { PublicFeedbackV2SubmissionSchema } from './v2/submission-payload.js';

/* * */

export const PublicFeedbackSubmissionSchema = z.discriminatedUnion('schema_version', [
	PublicFeedbackV1SubmissionSchema,
	PublicFeedbackV2SubmissionSchema,
]);

export const PublicFeedbackSchema = z.discriminatedUnion('schema_version', [
	PublicFeedbackV1Schema,
	PublicFeedbackV2Schema,
]);

/* * */

export type PublicFeedback = z.infer<typeof PublicFeedbackSchema>;
export type PublicFeedbackSubmission = z.infer<typeof PublicFeedbackSubmissionSchema>;
