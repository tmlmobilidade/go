/* * */

export function quantile(values: number[], percentile: number) {
	if (values.length === 0) return null;

	const sorted = [...values].sort((left, right) => left - right);
	const index = (sorted.length - 1) * percentile;
	const lowerIndex = Math.floor(index);
	const upperIndex = Math.ceil(index);
	const lower = sorted[lowerIndex] ?? 0;
	const upper = sorted[upperIndex] ?? lower;

	return lower + (upper - lower) * (index - lowerIndex);
}

export function median(values: number[]) {
	return quantile(values, 0.5);
}

/* * */
