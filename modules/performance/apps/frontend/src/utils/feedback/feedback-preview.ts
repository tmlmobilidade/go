/* * */

import type { PublicFeedback } from '@tmlmobilidade/types';

import { type FeedbackEntitySummary, getFeedbackEntitySummary } from './feedback-entities';
import { getFeedbackLineContributionMeters } from './feedback-line-contributions';
import { type FeedbackEntityType, getFeedbackMetricsByEntity } from './feedback-metrics';
import { getTopFeedbackReasonsByEntity, getTopFeedbackReasonsTrendByEntity } from './feedback-reasons';

/* * */

function buildTopFeedbackList(rows: PublicFeedback[], metrics: ReturnType<typeof getFeedbackMetricsByEntity>, entityType: FeedbackEntityType, labelsById: Map<string, string>): FeedbackEntitySummary[] {
	return metrics
		.slice(0, 6)
		.map((metric) => {
			// The contribution breakdown is only available for line details.
			const lineContributionMeters = entityType === 'line' ? getFeedbackLineContributionMeters(rows, metric) : undefined;
			return getFeedbackEntitySummary(metric, entityType, labelsById, lineContributionMeters);
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
