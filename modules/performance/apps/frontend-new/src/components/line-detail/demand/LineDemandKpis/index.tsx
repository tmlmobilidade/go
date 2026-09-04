'use client';

/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { formatOverTimePeriodLabel } from '@/utils/performance-period-labels';
import { Alert, Grid, Skeleton } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useLineDemandKpisData } from './useLineDemandKpisData';

/* * */

export function LineDemandKpis() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const kpis = useLineDemandKpisData();
	const formatters = usePerformanceFormatters();
	const { average, busiestPoint, comparisonLabel, currentTotal, differencePct, isSingleDay, peakHour, peakShare } = kpis.data;

	//
	// B. Render components

	if (kpis.flags.is_loading) return <Skeleton height={112} />;
	if (kpis.flags.has_error) return <Alert color="red" variant="light">{t('lineDetail.demandDashboard.demandError')}</Alert>;

	return (
		<Grid aria-label={t('lineDetail.demandDashboard.summary.ariaLabel')} columns="abcd" gap="sm" role="region">
			<MetricSummaryCard
				comparisonLabel={comparisonLabel}
				title={t('lineDetail.demandDashboard.summary.total')}
				trend={{ format: 'percentage', value: differencePct }}
				value={currentTotal}
				valueFormat="compact"
			/>
			<MetricSummaryCard
				supportingText={t('lineDetail.demandDashboard.summary.averageContext')}
				title={t(isSingleDay ? 'lineDetail.demandDashboard.summary.averageHourly' : 'lineDetail.demandDashboard.summary.averageDaily')}
				value={average}
				valueFormat="compact"
			/>
			<MetricSummaryCard
				supportingText={busiestPoint ? formatOverTimePeriodLabel(busiestPoint.period, isSingleDay ? 'hour' : 'day', formatters.locale) : '—'}
				title={t(isSingleDay ? 'lineDetail.demandDashboard.summary.busiestHour' : 'lineDetail.demandDashboard.summary.busiestDay')}
				value={busiestPoint?.passenger_demand}
				valueFormat="compact"
			/>
			<MetricSummaryCard
				supportingText={peakHour ? t('lineDetail.demandDashboard.summary.peakShare', { value: formatters.fixedDecimal(peakShare) }) : '—'}
				title={t('lineDetail.demandDashboard.summary.peakHour')}
				value={peakHour ? `${String(peakHour.hour).padStart(2, '0')}:00` : null}
				valueFormat="text"
			/>
		</Grid>
	);

	//
}
