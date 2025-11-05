/* * */

import { MetricCard } from '@/components/layout/MetricCard';
import { DemandByAgencyByDay } from '@/components/visualizations/DemandByAgencyByDay';
import { DemandByAgencyComparison } from '@/components/visualizations/DemandByAgencyComparison';
import { TopMeanDemandByLineByMonth } from '@/components/visualizations/TopMeanDemandByLineByMonth';
import { OPERATORS, OperatorType } from '@/constants';
import { Routes } from '@/routes';
import { DemandByAgencyByMonth } from '@go/types';
import { Combobox, Grid } from '@tmlmobilidade/ui';
import { Dates } from '@go/utils-dates';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

export default function SupplyDemandTopic() {
	//

	// A. Setup variables

	const t = useTranslations();
	const [selectedOperator, setSelectedOperator] = useState<OperatorType>(OPERATORS.ALL);
	const { data: demandByAgencyByMonth } = useSWR<DemandByAgencyByMonth[]>(Routes.DEMAND_BY_AGENCY_BY_MONTH);

	const currentYearMonth = Dates.now('Europe/Lisbon').toFormat('yyyy-MM');

	//
	// B. Transform data

	const formattedDemandByAgencyByMonth = useMemo(() => {
		if (!demandByAgencyByMonth?.length) {
			return {};
		}
		const result: Record<string, number> = {};

		demandByAgencyByMonth.forEach((agencyData) => {
			const monthData = agencyData.data[currentYearMonth];

			if (monthData) {
				result[agencyData.properties.agency_id] = monthData.qty || 0;
			}
		});

		const totalDemand = Object.values(result).reduce((sum, val) => sum + val, 0);
		result['all'] = totalDemand;

		return result;
	}, [demandByAgencyByMonth, currentYearMonth]);

	const operatorsData = useMemo(() =>
		Object.values(OPERATORS)
			.map(value => ({
				label: t(`operators.${value}`),
				value,
			})),
	[t]);

	const metricsData = [
		{
			goal: 'increase' as const,
			targetRange: [90, 95] as [number, number],
			title: 'Circulações com bilhética',
			totalValue: formattedData.scheduledRides,
			value: formattedData.ridesWithSales,
		},
	];

	// C. Render components

	return (
		<>
			<div style={{ width: 200 }}>
				<Combobox data={operatorsData} onChange={value => setSelectedOperator(value as OperatorType)} value={selectedOperator} />
			</div>
			<Grid columns="ab" gap="lg">
				<MetricCard goal="increase" title="Passageiros transportados no mês atual" value={formattedDemandByAgencyByMonth[selectedOperator]}>
					<Grid columns="ab" gap="md">
						{metricsData.map((metric, index) => (
							<div key={index} className={styles.kpiContainer}>
								<span className={styles.kpiTitle}>{metric.title}</span>

								<div className={styles.kpiBottomContainer}>

									{!data ? <MetricCardSkeleton height={70} /> : (
										<>
											<div className={styles.kpiValueContainer}>
												<span className={styles.kpiValue}>{metric.value.now}</span>

												<IndicatorChip
													goal={metric.goal}
													targetRange={metric.targetRange}
													totalValue={metric.totalValue.now}
													value={metric.value.now}
												/>

											</div>

											<TrendChip
												comparisonPreviousValue={metric.totalValue.last_week}
												comparisonValue={metric.totalValue.now}
												goal={metric.goal}
												previousValue={metric.value.last_week}
												value={metric.value.now}
											/>
										</>

									)}
								</div>
							</div>
						))}
					</Grid>

				</MetricCard>
				<TopMeanDemandByLineByMonth height={400} />

				<DemandByAgencyComparison chartType="line" height={400} operator={selectedOperator} />
				<DemandByAgencyByDay chartType="bar" height={400} operator={selectedOperator} isInsideFrame />
			</Grid>
		</>
	);
}

//
