/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { createCompactMetricValue, type MetricRollingValue } from '@/components/common/MetricValue';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { calculateMetricDifferencePct, createMetricTrend } from '@/utils/metric-trend';
import { type PlannedSupplyMetrics } from '@tmlmobilidade/go-types-performance';
import { Grid } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface LineSupplyKpisProps {
	comparison: PlannedSupplyMetrics
	comparisonLabel: string
	current: PlannedSupplyMetrics
}

/* * */

export function LineSupplyKpis({ comparison, comparisonLabel, current }: LineSupplyKpisProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const metrics: { comparison: number, current: number, label: string, value: MetricRollingValue }[] = [
		{ comparison: comparison.scheduled_rides_qty, current: current.scheduled_rides_qty, label: t('lineDetail.plannedSupply.summary.rides'), value: createCompactMetricValue(current.scheduled_rides_qty) },
		{ comparison: comparison.scheduled_vehicle_km, current: current.scheduled_vehicle_km, label: t('lineDetail.plannedSupply.summary.vehicleKm'), value: createCompactMetricValue(current.scheduled_vehicle_km, ' km') },
		{ comparison: comparison.rides_per_active_day, current: current.rides_per_active_day, label: t('lineDetail.plannedSupply.summary.ridesPerDay'), value: createCompactMetricValue(current.rides_per_active_day) },
		{ comparison: comparison.vehicle_km_per_active_day, current: current.vehicle_km_per_active_day, label: t('lineDetail.plannedSupply.summary.kmPerDay'), value: createCompactMetricValue(current.vehicle_km_per_active_day, ' km') },
	];

	//
	// B. Render components

	return (
		<Grid aria-label={t('lineDetail.plannedSupply.summary.ariaLabel')} columns="abcd" gap="sm" role="region">
			{metrics.map((metric) => {
				const difference = calculateMetricDifferencePct(metric.current, metric.comparison);
				return (
					<MetricSummaryCard
						key={metric.label}
						comparisonLabel={comparisonLabel}
						title={metric.label}
						trend={createMetricTrend(difference, { formatValue: formatters.signedPercentage })}
						value={metric.value}
					/>
				);
			})}
		</Grid>
	);

	//
}
