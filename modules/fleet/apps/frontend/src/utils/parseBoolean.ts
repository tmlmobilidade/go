export const parseBoolean = (value?: string): boolean => {
	if (!value) return false;

	const normalizedValue = value.trim().toLowerCase();
	if (normalizedValue === '1' || normalizedValue === 'true') return true;
	if (normalizedValue === '0' || normalizedValue === 'false') return false;

	throw new Error(`Invalid boolean value: ${value}`);
};
