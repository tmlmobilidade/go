/* * */

import type { FeedbackLineRowData, FeedbackTopicData } from '../../types';
import type { FeedbackPreviewResponse } from '../types';

import { calculateFeedbackSatisfactionIndex, type FeedbackEntityType, formatSatisfactionIndex } from '../../feedback-metrics';
import { getLineLabel } from '../../network-labels';
import { getEntityId, getFeedbackCount, LINE_FIELD_CANDIDATES, STOP_FIELD_CANDIDATES } from './feedback-preview-records';

/* * */

export const EMPTY_FEEDBACK_TOPIC_DATA: FeedbackTopicData = {
	chartBars: [],
	topLines: [],
	topStops: [],
};

/* * */

function getEntityLabel(entityId: string, entityType: FeedbackEntityType, labelsById: Map<string, string>) {
	if (entityType === 'line') return getLineLabel(entityId, labelsById);
	return labelsById.get(entityId) ?? entityId;
}

function buildTopFeedbackList(rows: Record<string, unknown>[], entityType: FeedbackEntityType, fieldCandidates: string[], labelsById: Map<string, string>): (FeedbackLineRowData & { count: number })[] {
	const groupedRows = new Map<string, { count: number, happyCount: number, label: string, unhappyCount: number }>();

	for (const row of rows) {
		const entityId = getEntityId(row, entityType, fieldCandidates);
		if (!entityId) continue;

		const current = groupedRows.get(entityId);
		const label = getEntityLabel(entityId, entityType, labelsById);
		const feedbackCount = getFeedbackCount(row);

		groupedRows.set(entityId, {
			count: (current?.count ?? 0) + feedbackCount,
			happyCount: (current?.happyCount ?? 0) + (row.mood === 'happy' ? feedbackCount : 0),
			label,
			unhappyCount: (current?.unhappyCount ?? 0) + (row.mood === 'unhappy' ? feedbackCount : 0),
		});
	}

	return Array.from(groupedRows.entries())
		.map(([id, groupData]) => {
			const satisfactionIndex = calculateFeedbackSatisfactionIndex(groupData.happyCount, groupData.unhappyCount);

			return {
				count: groupData.count,
				description: groupData.label === id ? undefined : id,
				id,
				metric: groupData.count.toLocaleString('pt-PT'),
				name: groupData.label,
				satisfactionIndex,
				satisfactionMetric: formatSatisfactionIndex(satisfactionIndex),
			};
		})
		.sort((a, b) => b.count - a.count)
		.slice(0, 6);
}

function toFeedbackRows(rows: (FeedbackLineRowData & { count: number })[]) {
	return rows.map(row => ({
		description: row.description,
		id: row.id,
		metric: row.metric,
		name: row.name,
		satisfactionIndex: row.satisfactionIndex,
		satisfactionMetric: row.satisfactionMetric,
	}));
}

/* * */

export function parseFeedbackPreviewData(feedbackPreviewData: FeedbackPreviewResponse, linesById: Map<string, string>, stopsById: Map<string, string>): FeedbackTopicData {
	const topLines = buildTopFeedbackList(feedbackPreviewData.rows, 'line', LINE_FIELD_CANDIDATES, linesById);
	const topStops = buildTopFeedbackList(feedbackPreviewData.rows, 'stop', STOP_FIELD_CANDIDATES, stopsById);

	return {
		chartBars: topLines.map(line => ({
			id: line.id,
			label: String(line.name),
			value: line.count,
		})),
		chartTitle: `Preview ${feedbackPreviewData.source.database}.${feedbackPreviewData.source.table}`,
		topLines: toFeedbackRows(topLines),
		topStops: toFeedbackRows(topStops),
	};
}
