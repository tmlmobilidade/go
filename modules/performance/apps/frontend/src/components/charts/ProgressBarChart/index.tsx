'use client';

import { generateColors } from '@/utils/metrics';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { ProgressBarResult } from '@/utils/metrics/types/chartResults';
import { Dates } from '@tmlmobilidade/dates';
import { CompositeChart, CompositeChartSeries, MetricsSkeleton } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface ProgressBarChartProps {
	data: ProgressBarResult
	endDate: Dates
	height?: number
	referenceVariable?: string
	startDate: Dates
	style?: React.CSSProperties
	timeView: 'annual' | 'daily' | 'monthly'
	yAxisLabel?: string
}

/* * */

export function ProgressBarChart({ data, height, referenceVariable, style, timeView }: ProgressBarChartProps) {
	//

	// A. Setup variables

	//
	// B. Transform data

	const dataKey = timeView === 'monthly' ? 'month' : timeView === 'annual' ? 'year' : 'day_detailed';

	const xAxisFormatter = useMemo(() => {
		return (value: string) => {
			return timeView === 'daily'
				? getShortLabelFromDetailed(value)
				: value;
		};
	}, [timeView]);

	const colors = generateColors(data?.series);

	const series = data?.series?.map(valueType => ({
		color: valueType === 'achieved' ? colors[valueType] : 'url(#achievedStripes)',
		label: valueType === 'achieved' ? 'Executado' : 'Planeado',
		name: valueType,
		type: 'bar',
	}));

	// Add reference line if applicable
	if (referenceVariable) series.push({
		color: 'var(--color-secondary)',
		label: referenceVariable,
		name: 'reference',
		type: 'line',
	});

	//
	// C. Render components

	return (
		<div style={{ width: '100%', ...style }}>
			{data.chart.length > 0 ? (
				<div className={styles.fadeIn}>
					<CompositeChart
						data={data.chart}
						dataKey={dataKey}
						h={height || 200}
						legendProps={{ verticalAlign: 'bottom' }}
						series={series as CompositeChartSeries[]}
						valueFormatter={v => v.toLocaleString('pt-PT')}
						withLegend={true}
						withXAxis={true}
						withYAxis={true}
						xAxisProps={{ tickFormatter: xAxisFormatter }}
					>
						<defs>
							<pattern
								height={8}
								id="achievedStripes"
								patternTransform="rotate(45)"
								patternUnits="userSpaceOnUse"
								width={6}
							>
								<rect
									fill="#32CD32"
									height="8"
									width="2"
								/>
							</pattern>
						</defs>
					</CompositeChart>
				</div>
			) : (
				<div style={{ height: height || 200 }}>
					<MetricsSkeleton />
				</div>
			)}
		</div>
	);
}
