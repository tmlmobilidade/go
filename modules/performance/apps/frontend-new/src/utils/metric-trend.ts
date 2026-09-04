/* * */

export type MetricTrendDirection = 'down' | 'flat' | 'up';
export type MetricTrendSentiment = 'negative' | 'neutral' | 'positive' | 'warning';

export function getMetricTrendDirection(value: number): MetricTrendDirection {
	return value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
}

export function getMetricTrendSentiment(value: number, positiveWhenIncreasing = true): MetricTrendSentiment {
	return value === 0
		? 'neutral'
		: (value > 0) === positiveWhenIncreasing ? 'positive' : 'negative';
}

export function calculateMetricDifferencePct(
	current: null | number,
	comparison: null | number,
): null | number {
	if (current === null || comparison === null || comparison === 0) return null;
	return (current - comparison) / comparison * 100;
}
