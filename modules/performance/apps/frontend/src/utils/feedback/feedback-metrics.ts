/* * */

import type { SystemStatusType } from '@/constants';
import type { PublicFeedback } from '@tmlmobilidade/types';

/* * */

export type FeedbackEntityType = PublicFeedback['entity_type'];

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
