/* * */

import { MetricSummaryCard } from '@/components/common/MetricSummaryCard';
import { type MetricTrendDirection } from '@/components/common/MetricTrend';
import { type PassengerDemandComparison, type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { Skeleton } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDemandOverviewProps {
	comparison?: PassengerDemandComparison
	hasError?: boolean
	isLoading: boolean
	points: PassengerDemandOverTimePoint[]
	total: null | number
}

/* * */

const compactFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, notation: 'compact' });
const percentageFormatter = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

function formatPeriod(period: number) {
	const value = String(period);
	const date = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T12:00:00`);
	return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short' }).format(date);
}

function getTrendDirection(value: null | number | undefined): MetricTrendDirection {
	if (!value) return 'flat';
	return value > 0 ? 'up' : 'down';
}

/* * */

export function LineDemandOverview({ comparison, hasError = false, isLoading, points, total }: LineDemandOverviewProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');

	//
	// B. Transform data

	const latestPoints = useMemo(() => points.slice(-7), [points]);
	const maximumDemand = Math.max(...latestPoints.map(point => point.passenger_demand), 1);
	const difference = comparison?.difference_pct;
	const trend = difference === null || difference === undefined
		? undefined
		: {
			direction: getTrendDirection(difference),
			label: `${difference > 0 ? '+' : ''}${percentageFormatter.format(difference)}%`,
			sentiment: difference >= 0 ? 'positive' as const : 'negative' as const,
		};

	//
	// C. Render components

	if (isLoading) {
		return (
			<section aria-label={t('lineDetail.demand.ariaLabel')} className={styles.root}>
				<Skeleton className={styles.loadingCard} />
				<Skeleton className={styles.loadingHistory} />
			</section>
		);
	}

	return (
		<section aria-label={t('lineDetail.demand.ariaLabel')} className={styles.root}>
			<MetricSummaryCard
				comparisonLabel={t('lineDetail.demand.comparison')}
				sparklineData={points.map(point => point.passenger_demand)}
				title={t('lineDetail.demand.totalTitle')}
				trend={trend}
				value={total === null ? '—' : compactFormatter.format(total)}
			/>

			<article className={styles.history}>
				<header>
					<h2>{t('lineDetail.demand.historyTitle')}</h2>
					<p>{t('lineDetail.demand.historySubtitle')}</p>
				</header>

				{hasError ? <p className={styles.empty}>{t('lineDetail.demand.error')}</p> : latestPoints.length > 0 ? (
					<ul>
						{latestPoints.map(point => (
							<li key={point.period}>
								<time>{formatPeriod(point.period)}</time>
								<progress max={maximumDemand} value={point.passenger_demand} />
								<strong>{compactFormatter.format(point.passenger_demand)}</strong>
							</li>
						))}
					</ul>
				) : <p className={styles.empty}>{t('lineDetail.demand.empty')}</p>}
			</article>
		</section>
	);

	//
}
