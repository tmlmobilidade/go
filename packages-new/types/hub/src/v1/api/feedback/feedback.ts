/* * */

import { z } from 'zod';

import { PublicFeedbackV1Schema, PublicFeedbackV1SubmissionSchema } from './v1/feedback-v1.js';
import { PublicFeedbackV2Schema, PublicFeedbackV2SubmissionSchema } from './v2/feedback-v2.js';

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
