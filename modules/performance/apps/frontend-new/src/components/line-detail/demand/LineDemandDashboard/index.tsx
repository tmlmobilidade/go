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
import { useLineScopeContext } from '@/contexts/LineScope.context';
import { Alert, Grid, Section } from '@tmlmobilidade/ui';
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
	const lineScope = useLineScopeContext();

	//
	// B. Render components

	if (lineScope.flags.is_line_loading) {
		return <LineDetailLoadingState />;
	}

	if (lineScope.flags.has_line_error || !lineScope.data.line) {
		return <LineDetailNotFoundState lineId={lineId} />;
	}

	return (
		<Section className={styles.root} gap="md" padding="md">
			<LineDetailHeader line={lineScope.data.line} />
			<LineDetailNavigation activeItemId="demand" lineId={lineScope.data.line._id} />
			<header className={styles.intro}>
				<h2>{t('lineDetail.demandDashboard.title')}</h2>
				<p>{t('lineDetail.demandDashboard.description')}</p>
			</header>
			<LineDemandKpis />
			<Grid columns="aab" gap="md">
				<LineDemandEvolution withSummary={false} />
				<LineDemandRecords />
			</Grid>
			<Grid columns="ab" gap="md">
				<LineDemandHeatmap />
				<LineDemandComposition />
			</Grid>
			<Grid columns="ab" gap="md">
				<LineDemandContributions />
				<LineDemandProductivity />
			</Grid>
			<Alert color="gray" variant="light">{t('lineDetail.demandDashboard.dataState')}</Alert>
		</Section>
	);

	//
}
