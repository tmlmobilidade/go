export function toggleFeedbackReason(selectedValues: string[], reasonValue: string) {
	if (selectedValues.includes(reasonValue)) {
		return selectedValues.filter(value => value !== reasonValue);
	}

	return [...selectedValues, reasonValue];
}
