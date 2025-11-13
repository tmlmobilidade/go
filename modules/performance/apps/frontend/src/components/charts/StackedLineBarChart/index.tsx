'use client';

/* * */

import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { StackedResult } from '@/utils/metrics/unifiedTransforms';
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
		if (timeView !== 'daily') return []; // Only show reference lines for daily data

		return (data.chart as { day_detailed: string, qty: number }[])
			.filter(item => item.day_detailed?.includes('(')) // contains holiday/notes
			.map((item) => {
				// Extract only what's inside parentheses
				const match = item.day_detailed?.match(/\(([^)]+)\)/);
				const label = match ? match[1] : item.day_detailed;

				return {
					color: 'var(--color-primary)',
					label: label,
					labelPosition: 'top' as const,
					x: item.day_detailed,
				};
			});
	}, [data, timeView]);

	const xAxisFormatter = useMemo(() => {
		return (value: string) => {
			return timeView === 'daily'
				? getShortLabelFromDetailed(value)
				: value;
		};
	}, [timeView]);

	const generateChartColor = (index: number) => {
		const chartColors = [
			'var(--chart-color-1)',
			'var(--chart-color-2)',
			'var(--chart-color-3)',
			'var(--chart-color-4)',
			'var(--chart-color-5)',
		];

		return chartColors[index % chartColors.length];
	};

	const series = data.series.map((productId, index) => ({
		color: generateChartColor(index),
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
