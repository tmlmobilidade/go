/* * */

import type { PublicFeedback } from '@tmlmobilidade/types';

import { type FeedbackEntitySummary, getFeedbackEntitySummary } from '../../feedback-entities';
import { type FeedbackEntityType, getFeedbackMetricsByEntity } from '../../feedback-metrics';

/* * */

function buildTopFeedbackList(metrics: ReturnType<typeof getFeedbackMetricsByEntity>, entityType: FeedbackEntityType, labelsById: Map<string, string>): FeedbackEntitySummary[] {
	return metrics
		.slice(0, 6)
		.map(metric => getFeedbackEntitySummary(metric, entityType, labelsById));
}

/* * */

export function getFeedbackOverviewData(rows: PublicFeedback[], linesById: Map<string, string>, stopsById: Map<string, string>) {
	const lineMetrics = getFeedbackMetricsByEntity(rows, 'line');
	const stopMetrics = getFeedbackMetricsByEntity(rows, 'stop');

	return {
		topLines: buildTopFeedbackList(lineMetrics, 'line', linesById),
		topStops: buildTopFeedbackList(stopMetrics, 'stop', stopsById),
	};
}
