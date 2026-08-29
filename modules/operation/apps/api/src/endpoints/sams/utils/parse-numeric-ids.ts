/* * */

export function parseNumericIds(rawIds: string[]): number[] {
	return rawIds
		.map(part => part.trim())
		.filter(Boolean)
		.map(Number)
		.filter(id => Number.isInteger(id));
}
