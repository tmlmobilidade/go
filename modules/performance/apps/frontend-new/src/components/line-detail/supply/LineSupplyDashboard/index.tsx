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
import { useLineScopeContext } from '@/contexts/LineScope.context';
import { Alert, Grid, Section } from '@tmlmobilidade/ui';
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
	const lineScope = useLineScopeContext();

	//
	// B. Render components

	if (lineScope.flags.is_line_loading) return <LineDetailLoadingState />;
	if (lineScope.flags.has_line_error || !lineScope.data.line) return <LineDetailNotFoundState lineId={lineId} />;

	return (
		<Section className={styles.root} gap="md" padding="md">
			<LineDetailHeader line={lineScope.data.line} />
			<LineDetailNavigation activeItemId="supply" lineId={lineScope.data.line._id} />
			<header className={styles.intro}><h2>{t('lineDetail.plannedSupply.title')}</h2><p>{t('lineDetail.plannedSupply.description')}</p></header>
			<LineSupplyKpis />
			<Grid columns="aab" gap="md">
				<LineSupplyEvolution />
				<LineSupplyDayProfiles />
			</Grid>
			<div className={styles.planningGrid}>
				<LineSupplyHeatmap />
				<LineSupplyPatterns />
			</div>
			<Alert color="gray" variant="light">{t('lineDetail.plannedSupply.dataState')}</Alert>
		</Section>
	);

	//
}
