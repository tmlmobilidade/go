'use client';

/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { Alert, Grid, Skeleton } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useLineSupplyKpisData } from './useLineSupplyKpisData';

/* * */

export function LineSupplyKpis() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const kpis = useLineSupplyKpisData();
	const { comparison, comparisonLabel, current, differences } = kpis.data;

	//
	// B. Render components

	if (kpis.flags.is_loading) return <Skeleton height={112} />;
	if (kpis.flags.has_error || !comparison || !current || !differences) return <Alert color="red" variant="light">{t('lineDetail.plannedSupply.dashboardError')}</Alert>;

	const metrics: { current: number, differencePct: null | number, label: string, suffix?: string }[] = [
		{ current: current.scheduled_rides_qty, differencePct: differences.scheduled_rides_qty, label: t('lineDetail.plannedSupply.summary.rides') },
		{ current: current.scheduled_vehicle_km, differencePct: differences.scheduled_vehicle_km, label: t('lineDetail.plannedSupply.summary.vehicleKm'), suffix: ' km' },
		{ current: current.rides_per_active_day, differencePct: differences.rides_per_active_day, label: t('lineDetail.plannedSupply.summary.ridesPerDay') },
		{ current: current.vehicle_km_per_active_day, differencePct: differences.vehicle_km_per_active_day, label: t('lineDetail.plannedSupply.summary.kmPerDay'), suffix: ' km' },
	];

	return (
		<Grid aria-label={t('lineDetail.plannedSupply.summary.ariaLabel')} columns="abcd" gap="sm" role="region">
			{metrics.map(metric => (
				<MetricSummaryCard
					key={metric.label}
					comparisonLabel={comparisonLabel}
					title={metric.label}
					trend={{ format: 'percentage', value: metric.differencePct }}
					value={metric.current}
					valueFormat="compact"
					valueSuffix={metric.suffix}
				/>
			))}
		</Grid>
	);

	//
}
