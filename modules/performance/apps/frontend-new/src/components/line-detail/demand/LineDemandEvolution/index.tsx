'use client';

/* * */

import { DashboardCard } from '@/components/common/DashboardCard';
import { MetricText } from '@/components/common/MetricText';
import { MetricTrend } from '@/components/common/MetricTrend';
import { MetricValue } from '@/components/common/MetricValue';
import { PerformanceCsvExportButton } from '@/components/common/PerformanceCsvExportButton';
import { LineDemandChart } from '@/components/line-detail/demand/LineDemandChart';
import { Alert, Skeleton, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLineDemandEvolutionData } from './useLineDemandEvolutionData';

/* * */

interface LineDemandEvolutionProps {
	withSummary?: boolean
}

/* * */

export function LineDemandEvolution({ withSummary = true }: LineDemandEvolutionProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const evolution = useLineDemandEvolutionData();
	const { average, comparison, comparisonLabel, comparisonPoints, isSingleDay, line, points, total } = evolution.data;
	const chartComparison = evolution.flags.has_comparison_series ? comparison : undefined;
	const chartComparisonLabel = evolution.flags.has_comparison_series ? comparisonLabel : undefined;
	const exportButton = (
		<PerformanceCsvExportButton
			disabled={evolution.flags.has_error || !points.length}
			filenameParts={[line?.code]}
			metadata={{ line_code: line?.code, line_id: line?._id }}
			visualizationId="demand-evolution"
			datasets={[
				{ dimensions: { period_role: 'current' }, rows: points },
				{ dimensions: { period_role: 'comparison' }, rows: comparisonPoints },
			]}
		/>
	);

	//
	// B. Transform data

	const chart = evolution.flags.has_error ? <Alert color="red" variant="light">{t('lineDetail.demand.error')}</Alert> : points.length > 0 ? (
		<LineDemandChart
			comparisonLabel={chartComparisonLabel}
			comparisonPoints={comparisonPoints}
			comparisonValue={chartComparison?.comparison_qty}
			isSingleDay={isSingleDay}
			points={points}
		/>
	) : <p className={styles.empty}>{t('lineDetail.demand.empty')}</p>;

	//
	// C. Render components

	if (evolution.flags.is_loading) {
		return <Skeleton aria-label={t('lineDetail.demand.ariaLabel')} className={styles.loadingCard} />;
	}

	if (!withSummary) {
		return (
			<DashboardCard
				action={exportButton}
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
						<div className={styles.summaryHeading}>
							<div>
								<h2>{t('lineDetail.demand.totalTitle')}</h2>
								<p>{t(isSingleDay ? 'lineDetail.demand.historySubtitleHourly' : 'lineDetail.demand.historySubtitlePeriod')}</p>
							</div>
							{exportButton}
						</div>
					</header>

					<MetricValue className={styles.value} format="compact" value={total} />

					<MetricTrend
						comparisonLabel={comparisonLabel ?? t('lineDetail.demand.comparison')}
						format="percentage"
						value={comparison?.difference_pct}
					/>

					<div className={styles.context}>
						{average !== null && (
							<div className={styles.average}>
								<span>{t(isSingleDay ? 'lineDetail.demand.averageHourly' : 'lineDetail.demand.averageDaily')}</span>
								<MetricText as="strong" format="compact" value={average} />
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
