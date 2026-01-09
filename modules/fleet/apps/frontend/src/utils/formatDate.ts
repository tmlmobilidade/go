/**
 * Format date from YYYYMMDD to DD-MM-YYYY
 */
export function formatDate(value: string): string {
	if (!/^\d{8}$/.test(value)) return value;

	const year = value.slice(0, 4);
	const month = value.slice(4, 6);
	const day = value.slice(6, 8);

	return `${day}-${month}-${year}`;
}
