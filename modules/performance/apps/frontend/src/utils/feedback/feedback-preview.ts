/* * */

import type { PublicFeedback } from '@tmlmobilidade/go-types-performance';

import { type FeedbackEntitySummary, type FeedbackEntityType, getFeedbackEntitySummary, getFeedbackMetricsByEntity } from '../metrics/feedback-metrics';
import { getFeedbackLineContributionMeters } from './feedback-line-contributions';
import { type FeedbackReasonCategoryTranslator, type FeedbackReasonTranslator, getTopFeedbackReasonsByEntity, getTopFeedbackReasonsTrendByEntity } from './feedback-reasons';
import { getFeedbackStopReasonMeters } from './feedback-stop-reasons';

/* * */

function buildTopFeedbackList(rows: PublicFeedback[], metrics: ReturnType<typeof getFeedbackMetricsByEntity>, entityType: FeedbackEntityType, labelsById: Map<string, string>, translateReason: FeedbackReasonTranslator, translateReasonCategory: FeedbackReasonCategoryTranslator): FeedbackEntitySummary[] {
	return metrics
		.slice(0, 6)
		.map((metric) => {
			// The contribution breakdown is only available for line details.
			const lineContributionMeters = entityType === 'line' ? getFeedbackLineContributionMeters(rows, metric, translateReason, translateReasonCategory) : undefined;
			const stopReasonMeters = entityType === 'stop' ? getFeedbackStopReasonMeters(rows, metric, translateReason, translateReasonCategory) : undefined;
			return getFeedbackEntitySummary(metric, entityType, labelsById, lineContributionMeters, stopReasonMeters);
		});
}

/* * */

export function getFeedbackOverviewData(rows: PublicFeedback[], linesById: Map<string, string>, stopsById: Map<string, string>, translateReason: FeedbackReasonTranslator, translateReasonCategory: FeedbackReasonCategoryTranslator) {
	const lineMetrics = getFeedbackMetricsByEntity(rows, 'line');
	const stopMetrics = getFeedbackMetricsByEntity(rows, 'stop');

	return {
		topLineReasons: getTopFeedbackReasonsByEntity(rows, 'line', translateReason),
		topLineReasonsTrend: getTopFeedbackReasonsTrendByEntity(rows, 'line', translateReason),
		topLines: buildTopFeedbackList(rows, lineMetrics, 'line', linesById, translateReason, translateReasonCategory),
		topStopReasons: getTopFeedbackReasonsByEntity(rows, 'stop', translateReason),
		topStopReasonsTrend: getTopFeedbackReasonsTrendByEntity(rows, 'stop', translateReason),
		topStops: buildTopFeedbackList(rows, stopMetrics, 'stop', stopsById, translateReason, translateReasonCategory),
	};
}
