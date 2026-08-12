import { PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT, type PublicFeedbackReason } from '@tmlmobilidade/go-types-public-info';

/* * */

export function toggleFeedbackReason(selectedValues: PublicFeedbackReason[], reasonValue: PublicFeedbackReason) {
	if (selectedValues.includes(reasonValue)) {
		return selectedValues.filter(value => value !== reasonValue);
	}

	if (selectedValues.length >= PUBLIC_FEEDBACK_REASON_SELECTION_LIMIT) return selectedValues;

	return [...selectedValues, reasonValue];
}
