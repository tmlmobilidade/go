/* * */

export type MetricTrendDirection = 'down' | 'flat' | 'up';
export type MetricTrendSentiment = 'negative' | 'neutral' | 'positive' | 'warning';

export interface MetricTrendValue {
	direction: MetricTrendDirection
	label: string
	sentiment: MetricTrendSentiment
}

interface CreateMetricTrendOptions {
	formatValue: (value: number) => string
	positiveWhenIncreasing?: boolean
}

/* * */

export function getMetricTrendDirection(value: number): MetricTrendDirection {
	return value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
}

export function createMetricTrend(
	value: null | number | undefined,
	{ formatValue, positiveWhenIncreasing = true }: CreateMetricTrendOptions,
): MetricTrendValue | undefined {
	if (value === null || value === undefined) return undefined;

	const direction = getMetricTrendDirection(value);
	const sentiment = value === 0
		? 'neutral'
		: (value > 0) === positiveWhenIncreasing ? 'positive' : 'negative';

	return {
		direction,
		label: formatValue(value),
		sentiment,
	};
}

export function calculateMetricDifferencePct(
	current: null | number,
	comparison: null | number,
): null | number {
	if (current === null || comparison === null || comparison === 0) return null;
	return (current - comparison) / comparison * 100;
}
