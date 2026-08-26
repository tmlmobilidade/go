/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { createCompactMetricValue } from '@/components/common/MetricValue';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { createMetricTrend } from '@/utils/metric-trend';
import { formatOverTimePeriodLabel } from '@/utils/performance-period-labels';
import { type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { Grid } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface LineDemandKpisProps {
	busiestPoint?: PassengerDemandOverTimePoint
	comparisonLabel: string
	currentTotal: number
	differencePct: null | number
	isSingleDay: boolean
	peakHour?: { hour: number, passenger_demand: number }
	periodPointCount: number
}

/* * */

export function LineDemandKpis({ busiestPoint, comparisonLabel, currentTotal, differencePct, isSingleDay, peakHour, periodPointCount }: LineDemandKpisProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const average = periodPointCount ? currentTotal / periodPointCount : 0;
	const peakShare = peakHour && currentTotal ? peakHour.passenger_demand / currentTotal * 100 : 0;

	//
	// B. Render components

	return (
		<Grid aria-label={t('lineDetail.demandDashboard.summary.ariaLabel')} columns="abcd" gap="sm" role="region">
			<MetricSummaryCard
				comparisonLabel={comparisonLabel}
				title={t('lineDetail.demandDashboard.summary.total')}
				trend={createMetricTrend(differencePct, { formatValue: formatters.signedPercentage })}
				value={createCompactMetricValue(currentTotal)}
			/>
			<MetricSummaryCard
				supportingText={t('lineDetail.demandDashboard.summary.averageContext')}
				title={t(isSingleDay ? 'lineDetail.demandDashboard.summary.averageHourly' : 'lineDetail.demandDashboard.summary.averageDaily')}
				value={createCompactMetricValue(average)}
			/>
			<MetricSummaryCard
				supportingText={busiestPoint ? formatOverTimePeriodLabel(busiestPoint.period, isSingleDay ? 'hour' : 'day', formatters.locale) : '—'}
				title={t(isSingleDay ? 'lineDetail.demandDashboard.summary.busiestHour' : 'lineDetail.demandDashboard.summary.busiestDay')}
				value={busiestPoint ? createCompactMetricValue(busiestPoint.passenger_demand) : '—'}
			/>
			<MetricSummaryCard
				supportingText={peakHour ? t('lineDetail.demandDashboard.summary.peakShare', { value: formatters.fixedDecimal(peakShare) }) : '—'}
				title={t('lineDetail.demandDashboard.summary.peakHour')}
				value={peakHour ? `${String(peakHour.hour).padStart(2, '0')}:00` : '—'}
			/>
		</Grid>
	);

	//
}
