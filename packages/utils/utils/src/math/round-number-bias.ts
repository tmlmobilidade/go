/* * */

/**
 * Calculates the round number bias for an array of values.
 * @param values An array of numbers representing values.
 * @returns The round number bias of the values.
 */
export function roundNumberBias(values: number[]): number {
	// Fraction of values that are "round" (multiples of 5 or 10)
	const rounded = values.filter(d => d % 5 === 0 || d % 10 === 0).length;
	return rounded / values.length;
}
