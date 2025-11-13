/* * */

/**
 * Calculates the entropy for an array of values.
 * @param values An array of numbers representing values.
 * @returns The entropy of the values.
 */
export function entropy(values: number[]): number {
	const counts: Record<number, number> = {};
	for (const d of values) {
		const bucket = Math.round(d); // 1-second bins
		counts[bucket] = (counts[bucket] ?? 0) + 1;
	}
	const total = values.length;
	let entropy = 0;
	for (const count of Object.values(counts)) {
		const p = count / total;
		entropy -= p * Math.log2(p);
	}
	return entropy;
}
