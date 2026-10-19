export const parseMappedEnum = (
	value: string | undefined,
	map: Record<string, string>,
	fieldName: string,
): string => {
	if (!value) {
		throw new Error(`Missing enum value for ${fieldName}`);
	}

	const mapped = map[value];
	if (!mapped) {
		throw new Error(`Invalid enum value for ${fieldName}: ${value}`);
	}

	return mapped;
};
