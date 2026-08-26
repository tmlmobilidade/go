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
import { useLineOverviewData } from '@/hooks/useLineOverviewData';
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

	const lineOverview = useLineOverviewData(lineId);

	//
	// B. Render components

	if (lineOverview.flags.is_line_loading) {
		return <LineDetailLoadingState />;
	}

	if (lineOverview.flags.has_line_error || !lineOverview.data.line) {
		return <LineDetailNotFoundState lineId={lineId} />;
	}

	return (
		<Section className={styles.root} gap="md" padding="md">
			<LineDetailHeader line={lineOverview.data.line} />
			<LineDetailNavigation lineId={lineOverview.data.line._id} />
			<LineDemandEvolution
				comparison={lineOverview.data.comparison}
				comparisonLabel={lineOverview.data.comparisonLabel}
				comparisonPoints={lineOverview.data.comparisonPoints}
				hasError={lineOverview.flags.has_demand_error}
				isLoading={lineOverview.flags.is_demand_loading}
				isSingleDay={lineOverview.data.periods.isSingleDay}
				points={lineOverview.data.points}
				total={lineOverview.data.totalDemand}
			/>
			<LineOverviewOperationalPreview
				comparison={lineOverview.data.operationalComparison}
				comparisonLabel={lineOverview.data.comparisonLabel}
				hasError={lineOverview.flags.has_operational_error}
				isLoading={lineOverview.flags.is_operational_loading}
				points={lineOverview.data.operationalPoints}
			/>
			<Grid columns="ab" gap="md">
				<LineOverviewReliabilityHeatmap
					demandPoints={lineOverview.data.hourlyDemandPoints}
					hasDemandError={lineOverview.flags.has_demand_error}
					hasOperationalError={lineOverview.flags.has_operational_heatmap_error}
					isDemandLoading={lineOverview.flags.is_demand_loading}
					isOperationalLoading={lineOverview.flags.is_operational_heatmap_loading}
					operationalCells={lineOverview.data.operationalHeatmap}
				/>
				<LineOverviewPatternsTable
					demandByPatternCode={lineOverview.data.demandByPatternCode}
					hasDemandError={lineOverview.flags.has_pattern_demand_error}
					hasOperationalError={lineOverview.flags.has_pattern_operational_error}
					isLoading={lineOverview.flags.is_pattern_demand_loading || lineOverview.flags.is_pattern_operational_loading}
					operationalByPatternCode={lineOverview.data.operationalByPatternCode}
					patterns={lineOverview.data.line.patterns}
				/>
			</Grid>
		</Section>
	);

	//
}
