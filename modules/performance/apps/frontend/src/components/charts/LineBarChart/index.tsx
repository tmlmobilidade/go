'use client';

import { generateEventReferenceLines, TimeSeriesResult } from '@/utils/metrics';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { Dates } from '@tmlmobilidade/dates';
import { BarChart, LineChart, MetricsSkeleton } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface LineBarChartProps {
	data: TimeSeriesResult['chart']
	endDate: Dates
	height?: number
	startDate: Dates
	timeView: 'annual' | 'daily' | 'monthly'
	yAxisLabel?: string
}

/* * */

export function LineBarChart({ data, endDate, height, startDate, timeView, yAxisLabel = 'Nº de passageiros' }: LineBarChartProps) {
	//

	// A. Setup variables

	const t = useTranslations();

	//
	// B. Transform data

	const resolvedChartType = useMemo(() => {
		if (timeView === 'daily') {
			const daysInRange = Math.abs(endDate.diff(startDate, 'day'));
			return daysInRange > 30 ? 'line' : 'bar'; // More than 30 days = line chart
		}
		else if (timeView === 'monthly') {
			const monthsInRange = Math.abs(endDate.diff(startDate, 'month'));
			return monthsInRange > 12 ? 'line' : 'bar'; // More than 12 months = line chart
		}
		else if (timeView === 'annual') {
			return 'bar'; // Always use bar chart for yearly data
		}
	}, [timeView, startDate, endDate]);

	const dataKey = timeView === 'monthly' ? 'month' : timeView === 'annual' ? 'year' : 'day_detailed';

	const averageValue = useMemo(() => {
		if (!data || data.length === 0) return 0;
		const total = data.reduce((sum: number, item) => sum + item.qty, 0);
		return Math.round(total / data.length);
	}, [data]);

	const eventReferenceLines = useMemo(() => {
		return generateEventReferenceLines(data as unknown as Record<string, unknown>[], timeView);
	}, [data, timeView]);

	const xAxisFormatter = useMemo(() => {
		return (value: string) => {
			return timeView === 'daily'
				? getShortLabelFromDetailed(value)
				: value;
		};
	}, [timeView]);

	const series = useMemo(() => [
		{
			color: 'var(--color-primary)',
			label: yAxisLabel,
			name: 'qty',
		},
	], []);

	//
	// D. Render components

	return (
		<>
			{data.length > 0 ? (
				<div className={styles.fadeIn}>
					{resolvedChartType === 'line' ? (
						<LineChart
							curveType="monotone"
							data={data}
							dataKey={dataKey}
							h={height || 200}
							series={series}
							strokeWidth={5}
							styles={{ referenceLine: { strokeDasharray: '5 5' } }}
							valueFormatter={v => v.toLocaleString('pt-PT')}
							withDots={false}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: xAxisFormatter }}
							referenceLines={[
								{
									color: 'var(--color-system-text-300)',
									label: t('chart.series.average.label', { value: averageValue }),
									labelPosition: 'insideBottomRight',
									y: averageValue,
								},
								...eventReferenceLines,
							]}
						/>
					)
						: (
							<BarChart
								data={data}
								dataKey={dataKey}
								h={height || 200}
								series={series}
								valueFormatter={v => v.toLocaleString('pt-PT')}
								valueLabelProps={{ fill: 'white', position: 'inside' }}
								withXAxis={true}
								withYAxis={true}
								xAxisProps={{ tickFormatter: xAxisFormatter }}
								withBarValueLabel
							/>
						)}
				</div>
			) : (
				<div style={{ height: height || 200 }}>
					<MetricsSkeleton />
				</div>
			)}
		</>
	);
}
