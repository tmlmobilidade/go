export const formatValidationDate = (value?: string): string | undefined => {
	if (!value || !/^\d{8}$/.test(value)) return;

	const year = Number(value.slice(0, 4));
	const month = Number(value.slice(4, 6));
	const day = Number(value.slice(6, 8));

	if (year < 1990 || year > 2026) return;
	if (month < 1 || month > 12) return;
	if (day < 1 || day > 31) return;

	return value;
};
