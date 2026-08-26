'use client';

/* * */

import { LineDemandComposition } from '@/components/line-detail/demand/LineDemandComposition';
import { LineDemandContributions } from '@/components/line-detail/demand/LineDemandContributions';
import { LineDemandEvolution } from '@/components/line-detail/demand/LineDemandEvolution';
import { LineDemandHeatmap } from '@/components/line-detail/demand/LineDemandHeatmap';
import { LineDemandKpis } from '@/components/line-detail/demand/LineDemandKpis';
import { LineDemandProductivity } from '@/components/line-detail/demand/LineDemandProductivity';
import { LineDemandRecords } from '@/components/line-detail/demand/LineDemandRecords';
import { LineDetailHeader } from '@/components/line-detail/shell/LineDetailHeader';
import { LineDetailLoadingState } from '@/components/line-detail/shell/LineDetailLoadingState';
import { LineDetailNavigation } from '@/components/line-detail/shell/LineDetailNavigation';
import { LineDetailNotFoundState } from '@/components/line-detail/shell/LineDetailNotFoundState';
import { useLineDemandData } from '@/hooks/useLineDemandData';
import { Alert, Grid, Section, Skeleton } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineDemandDashboardProps {
	lineId: string
}

/* * */

export function LineDemandDashboard({ lineId }: LineDemandDashboardProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const lineDemand = useLineDemandData(lineId);

	//
	// B. Render components

	if (lineDemand.flags.is_line_loading) {
		return <LineDetailLoadingState />;
	}

	if (lineDemand.flags.has_line_error || !lineDemand.data.line) {
		return <LineDetailNotFoundState lineId={lineId} />;
	}

	return (
		<Section className={styles.root} gap="md" padding="md">
			<LineDetailHeader line={lineDemand.data.line} />
			<LineDetailNavigation activeItemId="demand" lineId={lineDemand.data.line._id} />
			<header className={styles.intro}>
				<h2>{t('lineDetail.demandDashboard.title')}</h2>
				<p>{t('lineDetail.demandDashboard.description')}</p>
			</header>
			{lineDemand.flags.is_demand_loading ? <Skeleton className={styles.loadingKpis} /> : (
				<>
					<LineDemandKpis
						busiestPoint={lineDemand.data.busiestPoint}
						comparisonLabel={lineDemand.data.comparisonLabel}
						currentTotal={lineDemand.data.currentTotal}
						differencePct={lineDemand.data.differencePct}
						isSingleDay={lineDemand.data.periods.isSingleDay}
						peakHour={lineDemand.data.peakHour}
						periodPointCount={lineDemand.data.currentPoints.length}
					/>
					<Grid columns="aab" gap="md">
						<LineDemandEvolution
							comparisonLabel={lineDemand.data.comparisonLabel}
							comparisonPoints={lineDemand.data.comparisonPoints}
							isLoading={false}
							isSingleDay={lineDemand.data.periods.isSingleDay}
							points={lineDemand.data.currentPoints}
							total={lineDemand.data.currentTotal}
							withSummary={false}
							comparison={{
								comparison_qty: lineDemand.data.comparisonTotal,
								current_qty: lineDemand.data.currentTotal,
								difference_pct: lineDemand.data.differencePct,
								difference_qty: lineDemand.data.currentTotal - lineDemand.data.comparisonTotal,
							}}
						/>
						{lineDemand.flags.is_dashboard_loading
							? <Skeleton className={styles.loadingRecords} />
							: <LineDemandRecords records={lineDemand.data.dashboard?.records ?? []} />}
					</Grid>
				</>
			)}

			{lineDemand.flags.has_demand_error && <Alert color="red" variant="light">{t('lineDetail.demandDashboard.demandError')}</Alert>}

			{lineDemand.flags.is_dashboard_loading ? <Skeleton className={styles.loadingContent} /> : lineDemand.data.dashboard ? (
				<>
					<Grid columns="ab" gap="md">
						<LineDemandHeatmap points={lineDemand.data.hourlyPoints} />
						<LineDemandComposition
							categories={lineDemand.data.dashboard.composition.categories}
							products={lineDemand.data.dashboard.composition.products}
						/>
					</Grid>
					<Grid columns="ab" gap="md">
						<LineDemandContributions
							patternMetadata={lineDemand.data.line.patterns}
							patterns={lineDemand.data.dashboard.contributions.patterns}
							stops={lineDemand.data.dashboard.contributions.stops}
						/>
						<LineDemandProductivity
							comparison={lineDemand.data.dashboard.productivity.comparison}
							current={lineDemand.data.dashboard.productivity.current}
						/>
					</Grid>
					<Alert color="gray" variant="light">{t('lineDetail.demandDashboard.dataState')}</Alert>
				</>
			) : <Alert color="red" variant="light">{t('lineDetail.demandDashboard.dashboardError')}</Alert>}
		</Section>
	);

	//
}
