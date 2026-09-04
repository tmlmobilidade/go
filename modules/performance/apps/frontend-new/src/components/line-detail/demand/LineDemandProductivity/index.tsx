'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { Alert, Grid, Skeleton } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useLineDemandProductivityData } from './useLineDemandProductivityData';

/* * */

export function LineDemandProductivity() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const productivityData = useLineDemandProductivityData();
	const productivity = productivityData.data.productivity;
	const comparison = productivity?.comparison;
	const current = productivity?.current;
	const differences = productivityData.data.differences;
	const showComparison = productivityData.flags.has_comparison;
	const metrics = current && comparison && differences ? [
		{
			differencePct: differences.validations_per_operated_ride,
			format: 'decimal' as const,
			label: t('lineDetail.demandDashboard.productivity.perRide'),
			value: current.validations_per_operated_ride,
		},
		{
			differencePct: differences.validations_per_delivered_vehicle_km,
			format: 'decimal' as const,
			label: t('lineDetail.demandDashboard.productivity.perVehicleKm'),
			value: current.validations_per_delivered_vehicle_km,
		},
		{
			differencePct: differences.operated_rides_qty,
			format: 'compact' as const,
			label: t('lineDetail.demandDashboard.productivity.operatedRides'),
			value: current.operated_rides_qty,
		},
		{
			differencePct: differences.delivered_vehicle_km,
			format: 'compact' as const,
			label: t('lineDetail.demandDashboard.productivity.deliveredKm'),
			value: current.delivered_vehicle_km,
		},
	] : [];
	const content = productivityData.flags.has_error
		? <Alert color="red" variant="light">{t('lineDetail.demandDashboard.dashboardError')}</Alert>
		: productivityData.flags.is_loading
			? <Skeleton height={180} />
			: (
				<Grid columns="abcd" gap="sm">
					{metrics.map(metric => (
						<MetricSummaryCard
							key={metric.label}
							title={metric.label}
							value={metric.value}
							valueFormat={metric.format}
							trend={showComparison ? {
								format: 'percentage',
								value: metric.differencePct,
							} : undefined}
						/>
					))}
				</Grid>
			);

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.productivity.description')}
			title={t('lineDetail.demandDashboard.productivity.title')}
		>
			{content}
		</DashboardCard>
	);

	//
}
