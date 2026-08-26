/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { MetricTrend } from '@/components/common/MetricTrend';
import { createCompactMetricValue, MetricValue } from '@/components/common/MetricValue';
import { LineDemandChart } from '@/components/line-detail/demand/LineDemandChart';
import { usePerformanceFormatters } from '@/hooks/usePerformanceFormatters';
import { createMetricTrend } from '@/utils/metric-trend';
import { type PassengerDemandComparison, type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { Alert, Skeleton, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDemandEvolutionProps {
	comparison?: PassengerDemandComparison
	comparisonLabel?: string
	comparisonPoints?: PassengerDemandOverTimePoint[]
	hasError?: boolean
	isLoading: boolean
	isSingleDay?: boolean
	points: PassengerDemandOverTimePoint[]
	total: null | number
	withSummary?: boolean
}

/* * */

export function LineDemandEvolution({ comparison, comparisonLabel, comparisonPoints = [], hasError = false, isLoading, isSingleDay = false, points, total, withSummary = true }: LineDemandEvolutionProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const formatters = usePerformanceFormatters();

	//
	// B. Transform data

	const difference = comparison?.difference_pct;
	const averageDemand = total === null || points.length === 0 ? null : total / points.length;
	const trend = createMetricTrend(difference, { formatValue: formatters.signedPercentage });
	const chart = hasError ? <Alert color="red" variant="light">{t('lineDetail.demand.error')}</Alert> : points.length > 0 ? (
		<LineDemandChart
			comparisonLabel={comparisonLabel}
			comparisonPoints={comparisonPoints}
			comparisonValue={comparison ? formatters.compact(comparison.comparison_qty) : undefined}
			isSingleDay={isSingleDay}
			points={points}
		/>
	) : <p className={styles.empty}>{t('lineDetail.demand.empty')}</p>;

	//
	// C. Render components

	if (isLoading) {
		return <Skeleton aria-label={t('lineDetail.demand.ariaLabel')} className={styles.loadingCard} />;
	}

	if (!withSummary) {
		return (
			<DashboardCard
				description={t(isSingleDay ? 'lineDetail.demand.historySubtitleHourly' : 'lineDetail.demand.historySubtitlePeriod')}
				title={t('lineDetail.demand.totalTitle')}
			>
				{chart}
			</DashboardCard>
		);
	}

	return (
		<Surface overflow="visible">
			<div aria-label={t('lineDetail.demand.ariaLabel')} className={styles.root} role="region">
				<div className={styles.summary}>
					<header>
						<h2>{t('lineDetail.demand.totalTitle')}</h2>
						<p>{t(isSingleDay ? 'lineDetail.demand.historySubtitleHourly' : 'lineDetail.demand.historySubtitlePeriod')}</p>
					</header>
					<MetricValue className={styles.value} value={total === null ? '—' : createCompactMetricValue(total)} />
					{trend && (
						<MetricTrend
							comparisonLabel={comparisonLabel ?? t('lineDetail.demand.comparison')}
							direction={trend.direction}
							label={trend.label}
							sentiment={trend.sentiment}
						/>
					)}
					<div className={styles.context}>
						{averageDemand !== null && (
							<div className={styles.average}>
								<span>{t(isSingleDay ? 'lineDetail.demand.averageHourly' : 'lineDetail.demand.averageDaily')}</span>
								<strong>{formatters.compact(averageDemand)}</strong>
							</div>
						)}
					</div>
				</div>

				<div className={styles.evolution}>{chart}</div>
			</div>
		</Surface>
	);

	//
}
