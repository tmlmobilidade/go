'use client';

import { generateColors, generateEventReferenceLines, StackedResult } from '@/utils/metrics';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { Dates } from '@tmlmobilidade/dates';
import { BarChart, LineChart, MetricsSkeleton } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface StackedLineBarChartProps {
	data: StackedResult
	endDate: Dates
	height?: number
	startDate: Dates
	style?: React.CSSProperties
	timeView: 'annual' | 'daily' | 'monthly'
	yAxisLabel?: string
}

/* * */

export function StackedLineBarChart({ data, height, style, timeView }: StackedLineBarChartProps) {
	//

	// A. Setup variables

	//
	// B. Transform data

	const dataKey = timeView === 'monthly' ? 'month' : timeView === 'annual' ? 'year' : 'day_detailed';
	const chartType = timeView === 'daily' ? 'line' : 'bar';

	const eventReferenceLines = useMemo(() => {
		return generateEventReferenceLines(data.chart, timeView);
	}, [data.chart, timeView]);

	const xAxisFormatter = useMemo(() => {
		return (value: string) => {
			return timeView === 'daily'
				? getShortLabelFromDetailed(value)
				: value;
		};
	}, [timeView]);

	const colors = generateColors(data.series);

	const series = data.series.map(productId => ({
		color: colors[productId],
		label: productId,
		name: productId,
	}));

	//
	// C. Render components

	return (
		<div style={{ width: '100%', ...style }}>
			{data.chart.length > 0 ? (
				<div className={styles.fadeIn}>
					{chartType === 'line' ? (
						<LineChart
							curveType="monotone"
							data={data.chart}
							dataKey={dataKey}
							h={height || 200}
							legendProps={{ verticalAlign: 'bottom' }}
							series={series}
							strokeWidth={5}
							styles={{ referenceLine: { strokeDasharray: '5 5' } }}
							valueFormatter={v => v.toLocaleString('pt-PT')}
							withDots={false}
							withLegend={true}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: xAxisFormatter }}
							referenceLines={[
								...eventReferenceLines,
							]}
						/>
					) : (
						<BarChart
							data={data.chart}
							dataKey={dataKey}
							h={height || 200}
							legendProps={{ verticalAlign: 'bottom' }}
							series={series}
							valueFormatter={v => v.toLocaleString('pt-PT')}
							withLegend={true}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: xAxisFormatter }}
						/>
					)}
				</div>
			) : (
				<div style={{ height: height || 200 }}>
					<MetricsSkeleton />
				</div>
			)}
		</div>
	);
}
