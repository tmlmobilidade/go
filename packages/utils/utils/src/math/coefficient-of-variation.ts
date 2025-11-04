/* * */

/**
 * Calculates the coefficient of variation for an array of numbers.
 * @param value An array of numbers.
 * @returns The coefficient of variation.
 */
export function coefficientOfVariation(values: number[]): number {
	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	if (mean === 0) return 0;
	const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
	const std = Math.sqrt(variance);
	return std / mean;
}
