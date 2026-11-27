/* * */

import { validationParams } from '@tmlmobilidade/go-utils-validation';
import { z } from 'zod';

import { type PublicFeedbackEntityType } from '../v1/entity-type.js';
import { getPublicFeedbackV2ReasonValuesByEntity, type PublicFeedbackV2Reason } from './reason.js';

/* * */

interface PublicFeedbackV2ReasonSelection {
	entity_type: PublicFeedbackEntityType
	reasons: PublicFeedbackV2Reason[]
}

export function validateReasonsForEntity(feedback: PublicFeedbackV2ReasonSelection, context: z.RefinementCtx) {
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
