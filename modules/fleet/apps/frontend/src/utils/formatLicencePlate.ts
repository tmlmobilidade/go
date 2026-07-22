export function formatLicencePlate(value: string): string {
	if (!value) return value;
	const f2 = value.slice(0, 2);
	const f4 = value.slice(2, 4);
	const f6 = value.slice(4, 6);

	return `${f2}-${f4}-${f6}`;
}
