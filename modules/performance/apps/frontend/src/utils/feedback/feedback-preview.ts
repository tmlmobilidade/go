/* * */

import type { PublicFeedback } from '@tmlmobilidade/go-types-performance';

import { type FeedbackEntitySummary, type FeedbackEntityType, getFeedbackEntitySummary, getFeedbackMetricsByEntity } from '../metrics/feedback-metrics';
import { getFeedbackLineContributionMeters } from './feedback-line-contributions';
import { getTopFeedbackReasonsByEntity, getTopFeedbackReasonsTrendByEntity } from './feedback-reasons';
import { getFeedbackStopReasonMeters } from './feedback-stop-reasons';

/* * */

function buildTopFeedbackList(rows: PublicFeedback[], metrics: ReturnType<typeof getFeedbackMetricsByEntity>, entityType: FeedbackEntityType, labelsById: Map<string, string>): FeedbackEntitySummary[] {
	return metrics
		.slice(0, 6)
		.map((metric) => {
			// The contribution breakdown is only available for line details.
			const lineContributionMeters = entityType === 'line' ? getFeedbackLineContributionMeters(rows, metric) : undefined;
			const stopReasonMeters = entityType === 'stop' ? getFeedbackStopReasonMeters(rows, metric) : undefined;
			return getFeedbackEntitySummary(metric, entityType, labelsById, lineContributionMeters, stopReasonMeters);
		});
}

/* * */

export function getFeedbackOverviewData(rows: PublicFeedback[], linesById: Map<string, string>, stopsById: Map<string, string>) {
	const lineMetrics = getFeedbackMetricsByEntity(rows, 'line');
	const stopMetrics = getFeedbackMetricsByEntity(rows, 'stop');

	return {
		topLineReasons: getTopFeedbackReasonsByEntity(rows, 'line'),
		topLineReasonsTrend: getTopFeedbackReasonsTrendByEntity(rows, 'line'),
		topLines: buildTopFeedbackList(rows, lineMetrics, 'line', linesById),
		topStopReasons: getTopFeedbackReasonsByEntity(rows, 'stop'),
		topStopReasonsTrend: getTopFeedbackReasonsTrendByEntity(rows, 'stop'),
		topStops: buildTopFeedbackList(rows, stopMetrics, 'stop', stopsById),
	};
}
