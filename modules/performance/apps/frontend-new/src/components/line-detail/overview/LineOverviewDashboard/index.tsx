'use client';

/* * */

import { LineDemandEvolution } from '@/components/line-detail/demand/LineDemandEvolution';
import { LineOverviewOperationalPreview } from '@/components/line-detail/overview/LineOverviewOperationalPreview';
import { LineOverviewPatternsTable } from '@/components/line-detail/overview/LineOverviewPatternsTable';
import { LineOverviewReliabilityHeatmap } from '@/components/line-detail/overview/LineOverviewReliabilityHeatmap';
import { LineDetailHeader } from '@/components/line-detail/shell/LineDetailHeader';
import { LineDetailLoadingState } from '@/components/line-detail/shell/LineDetailLoadingState';
import { LineDetailNavigation } from '@/components/line-detail/shell/LineDetailNavigation';
import { LineDetailNotFoundState } from '@/components/line-detail/shell/LineDetailNotFoundState';
import { useLineScopeContext } from '@/contexts/LineScope.context';
import { Grid, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface LineOverviewDashboardProps {
	lineId: string
}

/* * */

export function LineOverviewDashboard({ lineId }: LineOverviewDashboardProps) {
	//

	//
	// A. Setup variables

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
			<LineDetailNavigation lineId={lineScope.data.line._id} />
			<LineDemandEvolution />
			<LineOverviewOperationalPreview />
			<Grid columns="ab" gap="md">
				<LineOverviewReliabilityHeatmap />
				<LineOverviewPatternsTable />
			</Grid>
		</Section>
	);

	//
}
