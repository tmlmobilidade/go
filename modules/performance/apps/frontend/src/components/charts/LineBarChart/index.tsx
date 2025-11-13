'use client';

/* * */

import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { type DailyDataPoint, type MonthlyDataPoint, type YearlyDataPoint } from '@/utils/metrics/unifiedTransforms';
import { Dates } from '@tmlmobilidade/dates';
import { BarChart, LineChart, MetricsSkeleton } from '@tmlmobilidade/ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface LineBarChartProps {
	data: DailyDataPoint[] | MonthlyDataPoint[] | YearlyDataPoint[]
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
		if (timeView !== 'daily') return []; // Only show reference lines for daily data

		return (data as { day_detailed: string, qty: number }[])
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

	/**
     * Calculates optimal Y-axis domain to fill available chart space
     * @param data Array of chart data points
     * @param paddingPercent Percentage of padding to add (default: 10%)
     * @returns [minValue, maxValue] for Y-axis domain
     */
	const calculateYAxisDomain = (data: { qty?: number }[], paddingPercent = 10): [number, number] => {
		if (!data || data.length === 0) return [0, 100];

		const values = data.map(item => item.qty || 0).filter(val => val > 0);
		if (values.length === 0) return [0, 100];

		const min = Math.min(...values);
		const max = Math.max(...values);

		// If all values are the same, create a small range around the value
		if (min === max) {
			const value = min;
			const range = Math.max(value * 0.1, 10); // 10% of value or minimum 10
			return [Math.max(0, value - range), value + range];
		}

		const range = max - min;
		const padding = (range * paddingPercent) / 100;

		// Calculate bounds with padding
		const lowerBound = Math.max(0, min - padding);
		const upperBound = max + padding;

		// Round to nice numbers for cleaner appearance
		const roundedMin = Math.floor(lowerBound / Math.pow(10, Math.floor(Math.log10(range)) - 1)) * Math.pow(10, Math.floor(Math.log10(range)) - 1);
		const roundedMax = Math.ceil(upperBound / Math.pow(10, Math.floor(Math.log10(range)) - 1)) * Math.pow(10, Math.floor(Math.log10(range)) - 1);

		return [roundedMin, roundedMax];
	};

	const yAxisDomain = useMemo(() => {
		return calculateYAxisDomain(data);
	}, [data]);

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
							yAxisProps={{ domain: yAxisDomain }}
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
