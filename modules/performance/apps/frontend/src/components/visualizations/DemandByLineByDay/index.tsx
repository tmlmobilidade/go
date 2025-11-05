'use client';

/* * */

import { LiveIcon } from '@/components/layout/LiveIcon';
import { MetricsRoutes } from '@/routes';
import { transformDemandByLineByDay } from '@/utils/metrics/demandChartData';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { type DemandByLineByDay } from '@go/types';
import { BarChart, LineChart, MetricsSkeleton } from '@go/ui';
import { Dates } from '@go/dates';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function DemandByLineByDayVisualization({ chartType, endDate, height, lineId, startDate }: { chartType?: 'bar' | 'line', endDate?: Dates | null, height?: number, lineId?: string, startDate?: Dates | null }) {
	//

	// A. Setup variables

	const t = useTranslations();

	// B. Fetch data

	const { data } = useSWR<DemandByLineByDay[]>(MetricsRoutes.DEMAND_BY_LINE_BY_DAY);

	//
	// C. Transform data

	const formattedData = useMemo(
		() => transformDemandByLineByDay(data, startDate, endDate, lineId, t),
		[data, startDate, endDate, lineId],
	);

	const averageDemand = useMemo(() => {
		if (formattedData.all.chart.length === 0) return 0;
		const total = formattedData.all.chart.reduce((sum, item) => sum + item.qty, 0);
		return Math.round(total / formattedData.all.chart.length);
	}, [formattedData]);

	const eventReferenceLines = useMemo(() => {
		return formattedData.all.chart
			.filter(item => item.formatted_day_detailed.includes('(')) // contains holiday/notes
			.map((item) => {
				// Extract only what's inside parentheses
				const match = item.formatted_day_detailed.match(/\(([^)]+)\)/);
				const label = match ? match[1] : item.formatted_day_detailed;

				return {
					color: 'var(--color-primary)',
					label: label,
					labelPosition: 'top' as const,
					x: item.formatted_day_detailed,
				};
			});
	}, [formattedData]);

	//
	// D. Render components

	const hasData = formattedData.all.chart.length > 0;

	return (
		<div className={styles.container}>
			<div style={{ display: 'flex', gap: 'var(--size-spacing-xs)' }}>
				<p style={{ color: 'var(--text-muted, #6b7280)' }}>Passageiros transportados para a linha {lineId}</p>
				<LiveIcon updatedAt={formattedData.lastUpdated} />
			</div>

			{hasData ? (
				<div className={styles.fadeIn}>
					{chartType === 'line' ? (
						<LineChart
							color="var(--color-primary)"
							curveType="monotone"
							data={formattedData.all.chart}
							dataKey="formatted_day_detailed"
							h={height || 200}
							strokeWidth={5}
							styles={{ referenceLine: { strokeDasharray: '5 5' } }}
							valueFormatter={v => v.toLocaleString('pt-PT')}
							withDots={false}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: value => getShortLabelFromDetailed(value) }}
							referenceLines={[
								{
									color: 'var(--color-system-text-300)',
									label: t('chart.series.average.label', { value: averageDemand }),
									labelPosition: 'insideBottomRight',
									y: averageDemand,
								},
								...eventReferenceLines,
							]}
							series={[
								{
									color: 'var(--color-primary)',
									label: 'Nº de passageiros',
									name: 'qty',
								},
							]}
						/>
					)
						: (
							<BarChart
								color="var(--color-primary)"
								data={formattedData.all.chart}
								dataKey="formatted_day_detailed"
								h={height || 200}
								valueFormatter={v => v.toLocaleString('pt-PT')}
								valueLabelProps={{ fill: 'white', position: 'inside' }}
								withXAxis={true}
								withYAxis={true}
								series={[
									{
										color: 'var(--color-primary)',
										label: 'Nº de passageiros',
										name: 'qty',
									},
								]}
								withBarValueLabel
							/>
						)}
				</div>
			) : (
				<MetricsSkeleton height={height || 200} width="100%" />
			)}
		</div>
	);
}
