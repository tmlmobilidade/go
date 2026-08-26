'use client';

/* * */

import { LineDetailHeader } from '@/components/line-detail/shell/LineDetailHeader';
import { LineDetailLoadingState } from '@/components/line-detail/shell/LineDetailLoadingState';
import { LineDetailNavigation } from '@/components/line-detail/shell/LineDetailNavigation';
import { LineDetailNotFoundState } from '@/components/line-detail/shell/LineDetailNotFoundState';
import { LineSupplyDayProfiles } from '@/components/line-detail/supply/LineSupplyDayProfiles';
import { LineSupplyEvolution } from '@/components/line-detail/supply/LineSupplyEvolution';
import { LineSupplyHeatmap } from '@/components/line-detail/supply/LineSupplyHeatmap';
import { LineSupplyKpis } from '@/components/line-detail/supply/LineSupplyKpis';
import { LineSupplyPatterns } from '@/components/line-detail/supply/LineSupplyPatterns';
import { useLineSupplyData } from '@/hooks/useLineSupplyData';
import { Alert, Grid, Section, Skeleton } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LineSupplyDashboardProps { lineId: string }

/* * */

export function LineSupplyDashboard({ lineId }: LineSupplyDashboardProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('default');
	const lineSupply = useLineSupplyData(lineId);

	//
	// B. Render components

	if (lineSupply.flags.is_line_loading) return <LineDetailLoadingState />;
	if (lineSupply.flags.has_line_error || !lineSupply.data.line) return <LineDetailNotFoundState lineId={lineId} />;

	return (
		<Section className={styles.root} gap="md" padding="md">
			<LineDetailHeader line={lineSupply.data.line} />
			<LineDetailNavigation activeItemId="supply" lineId={lineSupply.data.line._id} />
			<header className={styles.intro}><h2>{t('lineDetail.plannedSupply.title')}</h2><p>{t('lineDetail.plannedSupply.description')}</p></header>
			{lineSupply.flags.is_dashboard_loading ? <Skeleton className={styles.loadingContent} /> : lineSupply.data.dashboard ? (
				<>
					<LineSupplyKpis comparison={lineSupply.data.dashboard.comparison} comparisonLabel={lineSupply.data.comparisonLabel} current={lineSupply.data.dashboard.current} />
					<Grid columns="aab" gap="md">
						<LineSupplyEvolution comparison={lineSupply.data.dashboard.evolution.comparison} comparisonLabel={lineSupply.data.comparisonLabel} current={lineSupply.data.dashboard.evolution.current} />
						<LineSupplyDayProfiles profiles={lineSupply.data.dashboard.day_profiles} />
					</Grid>
					<div className={styles.planningGrid}>
						<LineSupplyHeatmap cells={lineSupply.data.dashboard.heatmap} />
						<LineSupplyPatterns items={lineSupply.data.dashboard.patterns} patterns={lineSupply.data.line.patterns} />
					</div>
					<Alert color="gray" variant="light">{t('lineDetail.plannedSupply.dataState')}</Alert>
				</>
			) : <Alert color="red" variant="light">{t('lineDetail.plannedSupply.dashboardError')}</Alert>}
		</Section>
	);

	//
}
