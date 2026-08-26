/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { calculateMetricDifferencePct, createMetricTrend } from '@/utils/metric-trend';
import { type PassengerDemandProductivityMetrics } from '@tmlmobilidade/go-types-performance';
import { Grid } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface LineDemandProductivityProps {
	comparison: PassengerDemandProductivityMetrics
	current: PassengerDemandProductivityMetrics
}

/* * */

export function LineDemandProductivity({ comparison, current }: LineDemandProductivityProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const metrics = [
		{
			comparison: comparison.validations_per_operated_ride,
			label: t('lineDetail.demandDashboard.productivity.perRide'),
			value: current.validations_per_operated_ride === null ? '—' : formatters.fixedDecimal(current.validations_per_operated_ride),
			valueRaw: current.validations_per_operated_ride,
		},
		{
			comparison: comparison.validations_per_delivered_vehicle_km,
			label: t('lineDetail.demandDashboard.productivity.perVehicleKm'),
			value: current.validations_per_delivered_vehicle_km === null ? '—' : formatters.fixedDecimal(current.validations_per_delivered_vehicle_km),
			valueRaw: current.validations_per_delivered_vehicle_km,
		},
		{
			comparison: comparison.operated_rides_qty,
			label: t('lineDetail.demandDashboard.productivity.operatedRides'),
			value: formatters.compact(current.operated_rides_qty),
			valueRaw: current.operated_rides_qty,
		},
		{
			comparison: comparison.delivered_vehicle_km,
			label: t('lineDetail.demandDashboard.productivity.deliveredKm'),
			value: formatters.compact(current.delivered_vehicle_km),
			valueRaw: current.delivered_vehicle_km,
		},
	];

	//
	// B. Render components

	return (
		<DashboardCard
			description={t('lineDetail.demandDashboard.productivity.description')}
			title={t('lineDetail.demandDashboard.productivity.title')}
		>
			<Grid columns="abcd" gap="sm">
				{metrics.map(metric => (
					<MetricSummaryCard
						key={metric.label}
						title={metric.label}
						value={metric.value}
						trend={createMetricTrend(
							calculateMetricDifferencePct(metric.valueRaw, metric.comparison),
							{ formatValue: formatters.signedPercentage },
						)}
					/>
				))}
			</Grid>
		</DashboardCard>
	);

	//
}
