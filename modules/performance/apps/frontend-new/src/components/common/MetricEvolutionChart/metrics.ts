/* * */

export interface MetricEvolutionPoint {
	period: number
	value: number
}

export interface AggregatedMetricEvolutionPoint extends MetricEvolutionPoint {
	periodEnd?: number
}

/* * */

export function aggregateMetricEvolutionPoints(
	points: MetricEvolutionPoint[],
	shouldAggregate: boolean,
): AggregatedMetricEvolutionPoint[] {
	if (!shouldAggregate) return points;

	return Array.from({ length: Math.ceil(points.length / 7) }, (_, index) => {
		const group = points.slice(index * 7, index * 7 + 7);

		return {
			period: group[0].period,
			periodEnd: group.at(-1)?.period,
			value: group.reduce((total, point) => total + point.value, 0),
		};
	});
}
