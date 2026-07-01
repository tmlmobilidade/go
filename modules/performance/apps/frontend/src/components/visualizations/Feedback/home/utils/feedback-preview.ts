/* * */

import type { PublicFeedback } from '@tmlmobilidade/types';

import { type FeedbackEntitySummary, getFeedbackEntitySummary } from '../../utils/feedback-entities';
import { getFeedbackLineContributionMeters } from '../../utils/feedback-line-contributions';
import { type FeedbackEntityType, getFeedbackMetricsByEntity } from '../../utils/feedback-metrics';

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
		topLines: buildTopFeedbackList(rows, lineMetrics, 'line', linesById),
		topStops: buildTopFeedbackList(rows, stopMetrics, 'stop', stopsById),
	};
}
