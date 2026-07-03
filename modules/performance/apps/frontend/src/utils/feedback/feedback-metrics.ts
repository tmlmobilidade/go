/* * */

import type { FeedbackLineContributionMeter } from './feedback-line-contributions';
import type { FeedbackStopReasonMeter } from './feedback-stop-reasons';
import type { SystemStatusType } from '@/constants';
import type { PublicFeedback } from '@tmlmobilidade/types';

import { getLineLabel } from './network-labels';

/* * */

export type FeedbackEntityType = PublicFeedback['entity_type'];

export interface FeedbackEntitySummary {
	count: number
	description?: string
	id: string
	label: string
	lineContributionMeters?: FeedbackLineContributionMeter[]
	operatorId?: string
	satisfactionIndex: number
	stopReasonMeters?: FeedbackStopReasonMeter[]
}

export interface FeedbackEntityMetrics {
	entityId: string
	feedbackCount: number
	operatorId?: string
	satisfactionIndex: number
}

interface FeedbackEntityMetricCounts {
	feedbackCount: number
	happyFeedbackCount: number
	operatorId?: string
	unhappyFeedbackCount: number
}

/* * */

function getEntityLabel(entityId: string, entityType: FeedbackEntityType, labelsById: Map<string, string>) {
	if (entityType === 'line') return getLineLabel(entityId, labelsById);
	return labelsById.get(entityId) ?? entityId;
}

export function getFeedbackEntitySummary(metric: FeedbackEntityMetrics, entityType: FeedbackEntityType, labelsById: Map<string, string>, lineContributionMeters?: FeedbackLineContributionMeter[], stopReasonMeters?: FeedbackStopReasonMeter[]): FeedbackEntitySummary {
	const label = getEntityLabel(metric.entityId, entityType, labelsById);

	return {
		count: metric.feedbackCount,
		description: label === metric.entityId ? undefined : metric.entityId,
		id: metric.entityId,
		label,
		lineContributionMeters,
		operatorId: entityType === 'line' ? metric.operatorId : undefined,
		satisfactionIndex: metric.satisfactionIndex,
		stopReasonMeters,
	};
}

export function calculateFeedbackSatisfactionIndex(happyFeedbackCount: number, unhappyFeedbackCount: number) {
	const moodFeedbackCount = happyFeedbackCount + unhappyFeedbackCount;
	if (moodFeedbackCount === 0) return 0;
	return (happyFeedbackCount / moodFeedbackCount) * 100;
}

/* * */

export function formatSatisfactionIndex(value: number) {
	return `${value.toLocaleString('pt-PT', { maximumFractionDigits: 1 })}%`;
}

export function getFeedbackSatisfactionStatus(value?: number): SystemStatusType | undefined {
	if (value === undefined) return undefined;
	if (value < 30) return 'negative';
	if (value < 70) return 'warning';
	return 'positive';
}

export function getFeedbackMetricsByEntity(rows: PublicFeedback[], entityType: FeedbackEntityType): FeedbackEntityMetrics[] {
	const groupedFeedback = new Map<string, FeedbackEntityMetricCounts>();

	for (const row of rows) {
		if (row.entity_type !== entityType) continue;

		const current = groupedFeedback.get(row.entity_id);

		groupedFeedback.set(row.entity_id, {
			feedbackCount: (current?.feedbackCount ?? 0) + 1,
			happyFeedbackCount: (current?.happyFeedbackCount ?? 0) + (row.mood === 'happy' ? 1 : 0),
			operatorId: current?.operatorId ?? row.agency_id,
			unhappyFeedbackCount: (current?.unhappyFeedbackCount ?? 0) + (row.mood === 'unhappy' ? 1 : 0),
		});
	}

	return Array.from(groupedFeedback.entries())
		.map(([entityId, feedbackData]) => ({
			entityId,
			feedbackCount: feedbackData.feedbackCount,
			operatorId: feedbackData.operatorId,
			satisfactionIndex: calculateFeedbackSatisfactionIndex(feedbackData.happyFeedbackCount, feedbackData.unhappyFeedbackCount),
		}))
		.sort((entityA, entityB) => entityB.feedbackCount - entityA.feedbackCount);
}
