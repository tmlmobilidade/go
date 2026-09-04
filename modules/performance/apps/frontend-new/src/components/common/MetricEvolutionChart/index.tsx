'use client';

/* * */

import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { formatPerformanceValue, type PerformanceNumberFormat } from '@/utils/performance-formatters';
import { formatOverTimePeriodLabel, formatOverTimePeriodTooltipLabel } from '@/utils/performance-period-labels';
import { AreaChart, type AreaChartSeries } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

import { aggregateMetricEvolutionPoints, type MetricEvolutionPoint } from './metrics';

/* * */

type MetricEvolutionTimeGrain = 'day' | 'hour';

interface MetricEvolutionChartProps {
	ariaLabel: string
	comparisonLabel?: string
	comparisonPoints?: MetricEvolutionPoint[]
	comparisonValue?: number
	currentLabel: string
	points: MetricEvolutionPoint[]
	timeGrain: MetricEvolutionTimeGrain
	valueFormat?: PerformanceNumberFormat
	weeklyAggregationLabel: string
}

/* * */

export function MetricEvolutionChart({ ariaLabel, comparisonLabel, comparisonPoints = [], comparisonValue, currentLabel, points, timeGrain, valueFormat = 'compact', weeklyAggregationLabel }: MetricEvolutionChartProps) {
	//

	//
	// A. Setup variables

	const formatters = usePerformanceFormatters();
	const shouldAggregate = timeGrain === 'day' && points.length > 45;
	const formatValue = (value: number) => formatPerformanceValue(value, valueFormat, formatters);

	//
	// B. Transform data

	const chartPoints = useMemo(
		() => aggregateMetricEvolutionPoints(points, shouldAggregate),
		[points, shouldAggregate],
	);
	const comparisonChartPoints = useMemo(
		() => aggregateMetricEvolutionPoints(comparisonPoints, timeGrain === 'day' && comparisonPoints.length > 45),
		[comparisonPoints, timeGrain],
	);
	const data = chartPoints.map((point, index) => {
		const period = formatOverTimePeriodLabel(point.period, timeGrain, formatters.locale);
		const periodLabel = point.periodEnd
			? `${period}–${formatOverTimePeriodLabel(point.periodEnd, timeGrain, formatters.locale)}`
			: period;

		return {
			comparison: comparisonChartPoints[index]?.value,
			current: point.value,
			period: periodLabel,
			tooltipPeriod: formatOverTimePeriodTooltipLabel(point.period, timeGrain, formatters.locale, point.periodEnd),
		};
	});
	const series: AreaChartSeries[] = [
		{ color: 'var(--color-primary)', label: currentLabel, name: 'current' },
		...(comparisonChartPoints.length ? [{
			color: 'var(--color-system-text-300)',
			label: `${comparisonLabel ?? ''}${comparisonValue === undefined ? '' : ` · ${formatValue(comparisonValue)}`}`,
			name: 'comparison',
			strokeDasharray: '5 5',
		}] : []),
	];

	//
	// C. Render components

	return (
		<div className={styles.root}>
			<AreaChart
				aria-label={ariaLabel}
				curveType="linear"
				data={data}
				dataKey="period"
				gridAxis="y"
				h={210}
				role="img"
				series={series}
				tickLine="none"
				tooltipProps={{ labelFormatter: (label, payload) => String(payload?.[0]?.payload?.tooltipPeriod ?? label) }}
				valueFormatter={formatValue}
				xAxisProps={{ interval: 'preserveStartEnd', minTickGap: 70 }}
				yAxisProps={{ tickFormatter: value => formatValue(Number(value)), width: 46 }}
				accessibilityLayer
				withLegend
				withTooltip
			/>
			{shouldAggregate && <p className={styles.aggregation}>{weeklyAggregationLabel}</p>}
		</div>
	);

	//
}
