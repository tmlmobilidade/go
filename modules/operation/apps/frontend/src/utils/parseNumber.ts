export const parseNumber = (
	value?: string,
	fieldName?: string,
): number => {
	const num = Number(value);
	if (Number.isNaN(num)) {
		throw new Error(`Invalid number for ${fieldName}: ${value}`);
	}
	return num;
};
