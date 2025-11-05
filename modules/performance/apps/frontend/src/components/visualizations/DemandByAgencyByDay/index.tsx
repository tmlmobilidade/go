'use client';

/* * */

import { VisualizationWrapper } from '@/components/layout/VisualizationWrapper';
import { OperatorType } from '@/constants';
import { useHomeContext } from '@/contexts/Home.context';
import { MetricsRoutes } from '@/routes';
import { transformDemandByAgencyByDay } from '@/utils/metrics/demandChartData';
import { getShortLabelFromDetailed } from '@/utils/metrics/formatDates';
import { type DemandByAgencyByDay as DemandByAgencyByDayType } from '@go/types';
import { BarChart, LineChart, MetricsSkeleton } from '@go/ui';
import { Dates } from '@go/dates';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export function DemandByAgencyByDay({ chartType, height, isInsideFrame, operator = 'all' }: { chartType?: 'bar' | 'line', height?: number, isInsideFrame?: boolean, operator?: OperatorType }) {
	//

	// A. Setup variables

	const t = useTranslations();

	const startDate = Dates.now('Europe/Lisbon').minus({ days: 7 });
	const endDate = Dates.now('Europe/Lisbon');

	const homeContext = useHomeContext();
	const selectedOperator = operator || homeContext.data.selected_operator;

	// B. Fetch data

	const { data } = useSWR<DemandByAgencyByDayType[]>(MetricsRoutes.DEMAND_BY_AGENCY_BY_DAY);

	//
	// C. Transform data

	const formattedData = useMemo(
		() => transformDemandByAgencyByDay(data, startDate, endDate, operator, t),
		[data, startDate, endDate, operator, t],
	);

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
		<VisualizationWrapper border={isInsideFrame ? '' : 'none'} lastUpdated={formattedData.lastUpdated} padding={isInsideFrame ? '' : '0'} title="Passageiros transportados por dia">
			{hasData ? (
				<div className={styles.fadeIn}>
					{chartType === 'line' ? (
						<LineChart
							color="var(--color-primary)"
							curveType="natural"
							data={dataToDisplay}
							dataKey="formatted_day_detailed"
							h={height || 200}
							strokeWidth={5}
							valueFormatter={v => v.toLocaleString('pt-PT')}
							withDots={false}
							withXAxis={true}
							withYAxis={true}
							xAxisProps={{ tickFormatter: value => getShortLabelFromDetailed(value) }}
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
								dataKey="formatted_day_detailed"
								h={height || 200}
								valueFormatter={v => v.toLocaleString('pt-PT')}
								valueLabelProps={{ fill: 'white', position: 'inside' }}
								withXAxis={true}
								withYAxis={true}
								xAxisProps={{ tickFormatter: value => getShortLabelFromDetailed(value) }}
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
		</VisualizationWrapper>
	);
}
