/* * */

import type { PublicFeedback } from '@tmlmobilidade/types';

import { type FeedbackEntityMetrics, type FeedbackEntityType, getFeedbackMetricsByEntity } from '../../feedback-metrics';
import { getLineLabel } from '../../network-labels';

/* * */

export interface FeedbackEntitySummary {
	count: number
	description?: string
	id: string
	label: string
	satisfactionIndex: number
}

function getEntityLabel(entityId: string, entityType: FeedbackEntityType, labelsById: Map<string, string>) {
	if (entityType === 'line') return getLineLabel(entityId, labelsById);
	return labelsById.get(entityId) ?? entityId;
}

function buildTopFeedbackList(metrics: FeedbackEntityMetrics[], entityType: FeedbackEntityType, labelsById: Map<string, string>): FeedbackEntitySummary[] {
	return metrics
		.slice(0, 6)
		.map((metric) => {
			const label = getEntityLabel(metric.entityId, entityType, labelsById);

			return {
				count: metric.feedbackCount,
				description: label === metric.entityId ? undefined : metric.entityId,
				id: metric.entityId,
				label,
				satisfactionIndex: metric.satisfactionIndex,
			};
		});
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
