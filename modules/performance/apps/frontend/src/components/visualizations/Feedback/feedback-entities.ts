/* * */

import { type FeedbackLineContributionMeter } from './feedback-line-contributions';
import { type FeedbackEntityMetrics, type FeedbackEntityType } from './feedback-metrics';
import { getLineLabel } from './network-labels';

/* * */

export interface FeedbackEntitySummary {
	count: number
	description?: string
	id: string
	label: string
	lineContributionMeters?: FeedbackLineContributionMeter[]
	satisfactionIndex: number
}

/* * */

function getEntityLabel(entityId: string, entityType: FeedbackEntityType, labelsById: Map<string, string>) {
	if (entityType === 'line') return getLineLabel(entityId, labelsById);
	return labelsById.get(entityId) ?? entityId;
}

export function getFeedbackEntitySummary(metric: FeedbackEntityMetrics, entityType: FeedbackEntityType, labelsById: Map<string, string>, lineContributionMeters?: FeedbackLineContributionMeter[]): FeedbackEntitySummary {
	const label = getEntityLabel(metric.entityId, entityType, labelsById);

	return {
		count: metric.feedbackCount,
		description: label === metric.entityId ? undefined : metric.entityId,
		id: metric.entityId,
		label,
		lineContributionMeters,
		satisfactionIndex: metric.satisfactionIndex,
	};
}
