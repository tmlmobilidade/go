/* * */

'use client';

/* * */

import type { FeedbackStopReasonCategory, FeedbackStopReasonMeter } from '@/utils/feedback/feedback-stop-reasons';

import { FeedbackBreakdownChart } from '../FeedbackBreakdownChart';

/* * */

const STOP_CATEGORY_CHART_HEIGHT = 220;
const STOP_CATEGORY_Y_AXIS_WIDTH = 56;
const STOP_REASON_CHART_MIN_HEIGHT = 220;
const STOP_REASON_CHART_ROW_HEIGHT = 44;
const STOP_REASON_CHART_Y_AXIS_WIDTH = 220;

/* * */

interface StopReasonBreakdownProps {
	entityId: string
	meters: FeedbackStopReasonMeter[]
}

/* * */

export function StopReasonBreakdown({ entityId, meters }: StopReasonBreakdownProps) {
	return (
		<FeedbackBreakdownChart<FeedbackStopReasonCategory>
			categoryChartHeight={STOP_CATEGORY_CHART_HEIGHT}
			categoryYAxisWidth={STOP_CATEGORY_Y_AXIS_WIDTH}
			entityId={entityId}
			meters={meters}
			reasonChartMinHeight={STOP_REASON_CHART_MIN_HEIGHT}
			reasonChartRowHeight={STOP_REASON_CHART_ROW_HEIGHT}
			reasonChartYAxisWidth={STOP_REASON_CHART_Y_AXIS_WIDTH}
			compactButtons
			hideWhenEmpty
		/>
	);
}
