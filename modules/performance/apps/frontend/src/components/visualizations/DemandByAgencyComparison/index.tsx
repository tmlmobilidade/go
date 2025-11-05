'use client';

/* * */

import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { type DemandByAgencyByDay as DemandByAgencyByDayType } from '@go/types';
import { BarChart, LineChart, LineChartProps, MetricsSkeleton } from '@go/ui';
import { Dates } from '@go/utils-dates';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

// TODO: cleanup this file
export function DemandByAgencyComparison({ chartType, height, operator }: { chartType?: 'bar' | 'line', height?: number, operator?: OperatorType }) {
	//

	// A. Setup variables

	const homeContext = useHomeContext();
	const selectedOperator = operator || homeContext.data.selected_operator;

	// B. Fetch data

	const { data } = useSWR<DemandByAgencyByDayType[]>(MetricsRoutes.DEMAND_BY_AGENCY_BY_DAY);

	//
	// C. Transform data

	const formattedData = useMemo(() => {
		if (!data?.length)
			return {
				agencies: {},
				all: { chart: [], sum: 0 },
				lastUpdated: null,
			};

		const agencies: Record<string, { chart: LineChartProps['data'], sum: number }> = {};
		let totalSum = 0;

		// Define period
		const endDate = Dates.now('Europe/Lisbon').minus({ days: 1 }).startOf('day');
		const startDate = endDate.minus({ days: 6 }).startOf('day');

		const endDateStr = endDate.iso.split('T')[0];
		const startDateStr = startDate.iso.split('T')[0];

		const previousStart = startDate.minus({ days: 7 });
		const previousEnd = endDate.minus({ days: 7 });

		const prevStartStr = previousStart.iso.split('T')[0];
		const prevEndStr = previousEnd.iso.split('T')[0];

		// Helper: format day labels like 'Mon 28/10'
		const formatLabel = (dateStr: string) => {
			const d = new Date(dateStr);
			return d.toLocaleDateString('pt-PT', {
				day: '2-digit',
				month: '2-digit',
				weekday: 'short',
			});
		};

		for (const item of data) {
			const agencyId = item.properties?.agency_id || 'unknown';
			const dayMap: Record<string, { current: number, previous: number }> = {};
			let agencySum = 0;

			Object.entries(item.data).forEach(([date, d]) => {
				if (date >= startDateStr && date <= endDateStr) {
					const label = formatLabel(date);
					if (!dayMap[label]) dayMap[label] = { current: 0, previous: 0 };
					dayMap[label].current += d.qty;
					agencySum += d.qty;
				}
				else if (date >= prevStartStr && date <= prevEndStr) {
					// find matching label 7 days later to align with current week day
					const nextWeekDate = new Date(new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000);
					const label = formatLabel(nextWeekDate.toISOString().split('T')[0]);
					if (!dayMap[label]) dayMap[label] = { current: 0, previous: 0 };
					dayMap[label].previous += d.qty;
				}
			});

			const chart: LineChartProps['data'] = Object.entries(dayMap)
				.map(([label, values]) => ({
					current_week: values.current,
					formatted_day: label,
					previous_week: values.previous,
					qty: values.current,
				}))
				.sort((a, b) =>
					new Date(a.formatted_day.split(' ')[1].split('/').reverse().join('-')).getTime()
					  - new Date(b.formatted_day.split(' ')[1].split('/').reverse().join('-')).getTime(),
				);

			totalSum += agencySum;
			agencies[agencyId] = { chart, sum: agencySum };
		}

		// Aggregate “all”
		const allMap: Record<string, { current: number, previous: number }> = {};
		for (const agency of Object.values(agencies)) {
			for (const entry of agency.chart) {
				if (!allMap[entry.formatted_day]) allMap[entry.formatted_day] = { current: 0, previous: 0 };
				allMap[entry.formatted_day].current += entry.current_week;
				allMap[entry.formatted_day].previous += entry.previous_week;
			}
		}

		const allChart: LineChartProps['data'] = Object.entries(allMap)
			.map(([label, values]) => ({
				current_week: values.current,
				formatted_day: label,
				previous_week: values.previous,
				qty: values.current,
			}))
			.sort((a, b) =>
				new Date(a.formatted_day.split(' ')[1].split('/').reverse().join('-')).getTime()
				  - new Date(b.formatted_day.split(' ')[1].split('/').reverse().join('-')).getTime(),
			);

		const lastUpdated
    = data.map(r => new Date(r.generated_at)).sort((a, b) => b.getTime() - a.getTime())[0] || null;

		return {
			agencies,
			all: { chart: allChart, sum: totalSum },
			lastUpdated,
		};
	}, [data]);

	const dataToDisplay = useMemo(() => {
		if (selectedOperator === 'all') {
			return formattedData.all.chart;
		}
		const agencyData = formattedData.agencies[selectedOperator];
		return agencyData ? agencyData.chart : [];
	}, [formattedData, selectedOperator]);

	//
	// D. Render components

	const hasData = dataToDisplay.length > 0;

	return (
		<VisualizationWrapper lastUpdated={formattedData.lastUpdated} title="Passageiros transportados na última semana vs semana passada">
			{hasData ? (
				<div className={styles.fadeIn}>
					{chartType === 'line' ? (
						<LineChart
							color="var(--color-primary)"
							curveType="monotone"
							data={dataToDisplay}
							dataKey="formatted_day"
							h={height || 200}
							strokeWidth={5}
							valueFormatter={v => v.toLocaleString('pt-PT')}
							withDots={false}
							withXAxis={true}
							withYAxis={true}
							series={[
								{
									color: '#e4e4e4',
									label: 'Semana anterior',
									name: 'previous_week',
								},
								{
									color: 'var(--color-primary)',
									label: 'Semana atual',
									name: 'current_week',
								},
							]}
						/>
					)
						: (
							<BarChart
								color="var(--color-primary)"
								data={dataToDisplay}
								dataKey="formatted_day"
								h={height || 200}
								valueFormatter={v => v.toLocaleString('pt-PT')}
								valueLabelProps={{ fill: 'white', position: 'inside' }}
								withXAxis={true}
								withYAxis={true}
								series={[
									{
										color: '#e4e4e4',
										label: 'Semana anterior',
										name: 'previous_week',
									},
									{
										color: 'var(--color-primary)',
										label: 'Semana atual',
										name: 'current_week',
									},
								]}
								withBarValueLabel
							/>
						)}
				</div>
			) : (
				<div style={{ height: height || 200 }}>
					<MetricsSkeleton />
				</div>
			)}
		</VisualizationWrapper>
	);
}
