export function formatDateTimeLocalInputValue(date: Date) {
	const offset = date.getTimezoneOffset();
	const localDate = new Date(date.getTime() - offset * 60_000);
	return localDate.toISOString().slice(0, 16);
}
