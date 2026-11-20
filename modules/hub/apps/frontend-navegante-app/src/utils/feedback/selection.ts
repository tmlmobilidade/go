import { PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT, type PublicFeedbackV2Reason } from '@tmlmobilidade/go-types-hub';

/* * */

export function toggleFeedbackReason(selectedValues: PublicFeedbackV2Reason[], reasonValue: PublicFeedbackV2Reason) {
	if (selectedValues.includes(reasonValue)) {
		return selectedValues.filter(value => value !== reasonValue);
	}

	if (selectedValues.length >= PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT) return selectedValues;

	return [...selectedValues, reasonValue];
}
