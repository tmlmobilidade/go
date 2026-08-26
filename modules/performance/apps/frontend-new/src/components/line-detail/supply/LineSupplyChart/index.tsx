'use client';

/* * */

import { MetricEvolutionChart } from '@/components/common/MetricEvolutionChart';
import { type PlannedSupplyOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { useTranslation } from 'react-i18next';

/* * */

interface LineSupplyChartProps {
	comparison: PlannedSupplyOverTimePoint[]
	comparisonLabel: string
	current: PlannedSupplyOverTimePoint[]
	metric: 'rides' | 'vehicleKm'
}

/* * */

function getValue(point: PlannedSupplyOverTimePoint, metric: LineSupplyChartProps['metric']) {
	return metric === 'rides' ? point.scheduled_rides_qty : point.scheduled_vehicle_km;
}

/* * */

export function LineSupplyChart({ comparison, comparisonLabel, current, metric }: LineSupplyChartProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');

	//
	// B. Render components

	return (
		<MetricEvolutionChart
			ariaLabel={t('lineDetail.plannedSupply.evolution.ariaLabel')}
			comparisonLabel={comparisonLabel}
			comparisonPoints={comparison.map(point => ({ period: point.operational_date, value: getValue(point, metric) }))}
			currentLabel={t('lineDetail.plannedSupply.evolution.current')}
			points={current.map(point => ({ period: point.operational_date, value: getValue(point, metric) }))}
			timeGrain="day"
			weeklyAggregationLabel={t('lineDetail.plannedSupply.evolution.weeklyAggregation')}
		/>
	);

	//
}
