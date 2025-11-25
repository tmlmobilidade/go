'use client';

/* * */

import { generateColors } from '@/utils/metrics';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { ProgressBarResult } from '@/utils/metrics/types/chartResults';
import { Dates } from '@tmlmobilidade/dates';
import { BarChart, MetricsSkeleton } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

interface ProgressBarChartProps {
	data: ProgressBarResult
	endDate: Dates
	height?: number
	startDate: Dates
	style?: React.CSSProperties
	timeView: 'annual' | 'daily' | 'monthly'
	yAxisLabel?: string
}

/* * */

export function ProgressBarChart({ data, height, style, timeView }: ProgressBarChartProps) {
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

	const colors = generateColors(data.series);

	const series = data.series.map(valueType => ({
		color: valueType === 'achieved' ? 'url(#achievedStripes)' : colors[valueType],
		label: valueType === 'achieved' ? 'Executado' : 'Planeado',
		name: valueType,
	}));

	//
	// C. Render components

	const bigBarWidth = 100; // make this dynamic
	const ratio = 0.5;
	const smallBarWidth = bigBarWidth * ratio;
	const barGap = (bigBarWidth + smallBarWidth) / -2;

	return (
		<div style={{ width: '100%', ...style }}>
			{data.chart.length > 0 ? (
				<div className={styles.fadeIn}>
					<BarChart
						// barChartProps={{ barGap: barGap }}
						// barProps={data => ({ barSize: data.name === 'total' ? bigBarWidth : smallBarWidth })}
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
					</BarChart>
				</div>
			) : (
				<div style={{ height: height || 200 }}>
					<MetricsSkeleton />
				</div>
			)}
		</div>
	);
}
