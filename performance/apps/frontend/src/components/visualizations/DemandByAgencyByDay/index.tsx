'use client';

/* * */

import { LiveIcon } from '@/components/layout/LiveIcon';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { type DemandByAgencyByDay as DemandByAgencyByDayType } from '@tmlmobilidade/types';
import { BarChart, LineChart, LineChartProps, MetricsSkeleton } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function DemandByAgencyByDay({ chartType, height, operator }: { chartType?: 'bar' | 'line', height?: number, operator?: OperatorType }) {
	//

	// A. Setup variables

	const t = useTranslations('dates');

	const START_DATE = Dates.now('Europe/Lisbon').minus({ days: 7 });
	const END_DATE = Dates.now('Europe/Lisbon');

	const homeContext = useHomeContext();
	const selectedOperator = operator || homeContext.data.selected_operator;

	// B. Fetch data

	const { data } = useSWR<DemandByAgencyByDayType[]>(MetricsRoutes.DEMAND_BY_AGENCY_BY_DAY);

	//
	// C. Transform data

	function formatDay(date: { day_group: string, day_type?: '1' | '2' | '3', holiday?: '0' | '1', notes?: string }) {
		if (!date.day_group) return '';
		const dt = Dates.fromISO(date.day_group);
		const formattedDate = t('formatted', { date: dt.js_date });
		const capitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

		if (date.holiday === '1') {
			const holidayText = date.notes?.length > 0 ? date.notes : t('holiday');
			return `${capitalized} (${holidayText})`;
		}

		return capitalized;
	}

	const formattedData = useMemo(() => {
		if (!data?.length)
			return {
				agencies: {},
				all: { chart: [], sum: 0 },
				lastUpdated: null,
			};

		const agencies: Record<string, { chart: LineChartProps['data'], sum: number }> = {};
		let totalSum = 0;

		const startDateStr = START_DATE.iso.split('T')[0];
		const endDateStr = END_DATE.iso.split('T')[0];

		for (const item of data) {
			const agencyId = item.properties?.agency_id || 'unknown';
			let agencySum = 0;
			const chart: LineChartProps['data'] = [];

			Object.entries(item.data)
				.filter(([date]) => date >= startDateStr && date <= endDateStr)
				.forEach(([date, d]) => {
					chart.push({ formatted_day: formatDay({ day_group: date, day_type: d.day_type, holiday: d.holiday, notes: d.notes }), qty: d.qty });
					agencySum += d.qty;
				});

			totalSum += agencySum;
			agencies[agencyId] = { chart, sum: agencySum };
		}

		const allMap: Record<string, number> = {};

		for (const agency of Object.values(agencies)) {
			for (const entry of agency.chart) {
				allMap[entry.formatted_day]
					= (allMap[entry.formatted_day] ?? 0) + entry.qty;
			}
		}

		const allChart: LineChartProps['data'] = Object.entries(allMap)
			.map(([formatted_day, qty]) => ({ formatted_day, qty }))
			.sort((a, b) => new Date(a.formatted_day).getTime() - new Date(b.formatted_day).getTime());

		const lastUpdated
			= data
				.map(r => new Date(r.generated_at))
				.sort((a, b) => b.getTime() - a.getTime())[0] || null;

		return {
			agencies,
			all: { chart: allChart, sum: totalSum },
			lastUpdated,
		};
	}, [data, START_DATE, END_DATE]);

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
		<div className={styles.container}>
			<div style={{ display: 'flex', gap: 'var(--size-spacing-xs)' }}>
				<p style={{ color: 'var(--text-muted, #6b7280)' }}>Passageiros transportados por dia</p>
				<LiveIcon updatedAt={formattedData.lastUpdated} />
			</div>

			{hasData ? (
				<div className={styles.fadeIn}>
					{chartType === 'line' ? (
						<LineChart
							color="var(--color-primary)"
							curveType="natural"
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
								data={dataToDisplay}
								dataKey="formatted_day"
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
				<div style={{ height: height || 200 }}>
					<MetricsSkeleton />
				</div>
			)}
		</div>
	);
}
