/* * */

'use client';

/* * */

import type { FeedbackLineContributionCategory, FeedbackLineContributionMeter } from '@/utils/feedback/feedback-line-contributions';

import { FeedbackBreakdownChart } from '../FeedbackBreakdownChart';

/* * */

const LINE_CONTRIBUTION_CHART_HEIGHT = 220;
const LINE_CONTRIBUTION_Y_AXIS_WIDTH = 56;
const REASON_CHART_MIN_HEIGHT = 180;
const REASON_CHART_ROW_HEIGHT = 44;
const REASON_CHART_Y_AXIS_WIDTH = 180;

/* * */

interface LineContributionBreakdownProps {
	entityId: string
	meters: FeedbackLineContributionMeter[]
}

/* * */

export function LineContributionBreakdown({ entityId, meters }: LineContributionBreakdownProps) {
	return (
		<FeedbackBreakdownChart<FeedbackLineContributionCategory>
			categoryChartHeight={LINE_CONTRIBUTION_CHART_HEIGHT}
			categoryYAxisWidth={LINE_CONTRIBUTION_Y_AXIS_WIDTH}
			entityId={entityId}
			meters={meters}
			reasonChartMinHeight={REASON_CHART_MIN_HEIGHT}
			reasonChartRowHeight={REASON_CHART_ROW_HEIGHT}
			reasonChartYAxisWidth={REASON_CHART_Y_AXIS_WIDTH}
		/>
	);
}
