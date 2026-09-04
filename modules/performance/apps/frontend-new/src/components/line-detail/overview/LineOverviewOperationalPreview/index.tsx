'use client';

/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { type RidePerformanceOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { Grid, Skeleton } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineOverviewOperationalPreviewData } from './useLineOverviewOperationalPreviewData';

export function LineOverviewOperationalPreview() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const operationalPreview = useLineOverviewOperationalPreviewData();
	const { comparison, comparisonLabel, points } = operationalPreview.data;
	const toSparklineData = (getValue: (point: RidePerformanceOverTimePoint) => null | number) => points.flatMap((point) => {
		const value = getValue(point);
		return value === null ? [] : [value];
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

			{operationalPreview.flags.has_error && <p className={styles.error}>{t('lineDetail.operationalPreview.error')}</p>}
			<Grid columns="abc" gap="sm">
				{operationalPreview.flags.is_loading ? Array.from({ length: 3 }, (_, index) => (
					<Skeleton key={index} className={styles.loadingCard} />
				)) : (
					<>
						<MetricSummaryCard
							comparisonLabel={comparisonLabel ?? t('lineDetail.operationalPreview.comparison')}
							sparklineData={toSparklineData(point => point.service_pct)}
							sparklineTone="success"
							title={t('lineDetail.operationalPreview.service.title')}
							trend={{ format: 'percentage-points', value: comparison?.service_delta_pp }}
							value={comparison?.current.service_pct}
							valueFormat="percentage"
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
							trend={{ format: 'percentage-points', positiveWhenIncreasing: false, value: comparison?.delays_delta_pp }}
							value={comparison?.current.delays_pct}
							valueFormat="percentage"
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
							trend={{ format: 'percentage-points', positiveWhenIncreasing: false, value: comparison?.advances_delta_pp }}
							value={comparison?.current.advances_pct}
							valueFormat="percentage"
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
