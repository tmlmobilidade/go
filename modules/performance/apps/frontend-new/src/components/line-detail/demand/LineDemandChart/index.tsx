'use client';

/* * */

import { MetricEvolutionChart } from '@/components/common/MetricEvolutionChart';
import { type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { useTranslation } from 'react-i18next';

/* * */

interface LineDemandChartProps {
	comparisonLabel?: string
	comparisonPoints?: PassengerDemandOverTimePoint[]
	comparisonValue?: number
	isSingleDay: boolean
	points: PassengerDemandOverTimePoint[]
}

/* * */

export function LineDemandChart({ comparisonLabel, comparisonPoints = [], comparisonValue, isSingleDay, points }: LineDemandChartProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');

	//
	// B. Render components

	return (
		<MetricEvolutionChart
			ariaLabel={t('lineDetail.demand.chartAriaLabel')}
			comparisonLabel={comparisonLabel}
			comparisonPoints={comparisonPoints.map(point => ({ period: point.period, value: point.passenger_demand }))}
			comparisonValue={comparisonValue}
			currentLabel={t('lineDetail.demand.selectedPeriod')}
			points={points.map(point => ({ period: point.period, value: point.passenger_demand }))}
			timeGrain={isSingleDay ? 'hour' : 'day'}
			weeklyAggregationLabel={t('lineDetail.demand.weeklyAggregation')}
		/>
	);

	//
}
