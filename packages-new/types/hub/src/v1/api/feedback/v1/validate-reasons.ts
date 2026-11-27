/* * */

import { validationParams } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

import { type PublicFeedbackEntityType } from './entity-type.js';
import { getPublicFeedbackReasonValuesByEntity, type PublicFeedbackReason } from './reason.js';

/* * */

interface PublicFeedbackReasonSelection {
	entity_type: PublicFeedbackEntityType
	reasons: PublicFeedbackReason[]
}

export function validateReasonsForEntity(feedback: PublicFeedbackReasonSelection, context: z.RefinementCtx) {
	const allowedReasons = new Set(getPublicFeedbackReasonValuesByEntity(feedback.entity_type));
	const selectedReasons = new Set();

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
