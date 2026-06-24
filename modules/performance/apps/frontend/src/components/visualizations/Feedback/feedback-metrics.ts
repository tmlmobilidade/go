/* * */

import type { SystemStatusType } from '@/constants';

/* * */

export type FeedbackEntityType = 'line' | 'stop';

export interface FeedbackEntitySatisfaction {
	entityId: string
	feedbackCount: number
	happyFeedbackCount: number
	satisfactionIndex: number
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

export function getFeedbackSatisfactionByEntity(rows: Record<string, unknown>[], entityType: FeedbackEntityType) {
	const groupedFeedback = new Map<string, Omit<FeedbackEntitySatisfaction, 'entityId' | 'satisfactionIndex'>>();

	for (const row of rows) {
		if (row.entity_type !== entityType || typeof row.entity_id !== 'string') continue;

		const current = groupedFeedback.get(row.entity_id);

		groupedFeedback.set(row.entity_id, {
			feedbackCount: (current?.feedbackCount ?? 0) + 1,
			happyFeedbackCount: (current?.happyFeedbackCount ?? 0) + (row.mood === 'happy' ? 1 : 0),
			unhappyFeedbackCount: (current?.unhappyFeedbackCount ?? 0) + (row.mood === 'unhappy' ? 1 : 0),
		});
	}

	return Array.from(groupedFeedback.entries())
		.map(([entityId, feedbackData]) => ({
			entityId,
			...feedbackData,
			satisfactionIndex: calculateFeedbackSatisfactionIndex(feedbackData.happyFeedbackCount, feedbackData.unhappyFeedbackCount),
		}))
		.sort((entityA, entityB) => entityB.feedbackCount - entityA.feedbackCount);
}
