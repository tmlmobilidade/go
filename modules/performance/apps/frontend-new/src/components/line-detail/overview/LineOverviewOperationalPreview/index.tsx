'use client';

/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { type MetricRollingValue } from '@/components/common/MetricValue';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { createMetricTrend } from '@/utils/metric-trend';
import { formatOverTimePeriodLabel } from '@/utils/performance-period-labels';
import { type RidePerformanceComparison, type RidePerformanceOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { Grid, Skeleton } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineOverviewOperationalPreviewProps {
	comparison?: RidePerformanceComparison
	comparisonLabel?: string
	hasError: boolean
	isLoading: boolean
	points: RidePerformanceOverTimePoint[]
}

/* * */

function rollingPercentage(value: null | number | undefined): MetricRollingValue | string {
	return value === null || value === undefined ? '—' : { decimalScale: 1, fixedDecimalScale: true, suffix: '%', value };
}

/* * */

export function LineOverviewOperationalPreview({ comparison, comparisonLabel, hasError, isLoading, points }: LineOverviewOperationalPreviewProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();
	const timeGrain = points.length > 0 && points[0].period > 99_999_999 ? 'hour' : 'day';
	const toSparklineData = (getValue: (point: RidePerformanceOverTimePoint) => null | number) => points.flatMap((point) => {
		const value = getValue(point);
		return value === null ? [] : [{
			label: `${formatOverTimePeriodLabel(point.period, timeGrain, formatters.locale)} · ${formatters.percentage(value)}`,
			value,
		}];
	});

	//
	// B. Render components

	return (
		<section aria-label={t('lineDetail.operationalPreview.ariaLabel')} className={styles.root}>
			<header className={styles.header}>
				<div>
					<h2>{t('lineDetail.operationalPreview.title')}</h2>
					<p>{t('lineDetail.operationalPreview.description')}</p>
				</div>
				<span className={styles.badge}>{t('lineDetail.operationalPreview.badge')}</span>
			</header>

			{hasError && <p className={styles.error}>{t('lineDetail.operationalPreview.error')}</p>}
			<Grid columns="abc" gap="sm">
				{isLoading ? Array.from({ length: 3 }, (_, index) => (
					<Skeleton key={index} className={styles.loadingCard} />
				)) : (
					<>
						<MetricSummaryCard
							comparisonLabel={comparisonLabel ?? t('lineDetail.operationalPreview.comparison')}
							sparklineData={toSparklineData(point => point.service_pct)}
							sparklineTone="success"
							title={t('lineDetail.operationalPreview.service.title')}
							trend={createMetricTrend(comparison?.service_delta_pp, { formatValue: formatters.signedPercentagePoints })}
							value={rollingPercentage(comparison?.current.service_pct)}
							progress={{
								label: t('lineDetail.operationalPreview.service.target'),
								value: comparison?.current.service_pct ?? 0,
							}}
						/>

						<MetricSummaryCard
							comparisonLabel={comparisonLabel ?? t('lineDetail.operationalPreview.comparison')}
							sparklineData={toSparklineData(point => point.delays_pct)}
							sparklineTone="warning"
							title={t('lineDetail.operationalPreview.delays.title')}
							trend={createMetricTrend(comparison?.delays_delta_pp, { formatValue: formatters.signedPercentagePoints, positiveWhenIncreasing: false })}
							value={rollingPercentage(comparison?.current.delays_pct)}
							progress={{
								label: t('lineDetail.operationalPreview.delays.target'),
								sentiment: 'warning',
								value: comparison?.current.delays_pct ?? 0,
							}}
						/>

						<MetricSummaryCard
							comparisonLabel={comparisonLabel ?? t('lineDetail.operationalPreview.comparison')}
							sparklineData={toSparklineData(point => point.advances_pct)}
							sparklineTone="accent"
							title={t('lineDetail.operationalPreview.advances.title')}
							trend={createMetricTrend(comparison?.advances_delta_pp, { formatValue: formatters.signedPercentagePoints, positiveWhenIncreasing: false })}
							value={rollingPercentage(comparison?.current.advances_pct)}
							progress={{
								label: t('lineDetail.operationalPreview.advances.target'),
								value: comparison?.current.advances_pct ?? 0,
							}}
						/>
					</>
				)}
			</Grid>
		</section>
	);

	//
}
