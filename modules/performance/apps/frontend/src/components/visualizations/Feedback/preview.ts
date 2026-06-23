/* * */

import type { FeedbackLineRowData, FeedbackTopicData } from './types';

/* * */

export interface FeedbackPreviewResponse {
	columns: string[]
	rows: Record<string, unknown>[]
	source: {
		database: string
		table: string
	}
}

/* * */

const LINE_FIELD_CANDIDATES = ['line_id', 'lineId', 'linha', 'route_id', 'routeId', 'id', '_id'];
const STOP_FIELD_CANDIDATES = ['stop_id', 'stopId', 'stop_code', 'stopCode', 'stop_name', 'stopName', 'paragem_id', 'paragem'];
const FEEDBACK_COUNT_FIELD_CANDIDATES = ['feedback_count', 'feedbacks', 'count', 'qty', 'total'];

/* * */

function formatPreviewValue(value: unknown) {
	if (value === null || value === undefined || value === '') return '-';
	if (typeof value === 'number') return value.toLocaleString('pt-PT');
	if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
	if (typeof value === 'string') return value;

	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

function getCandidateField(row: Record<string, unknown>, candidates: string[]) {
	return candidates.find(field => row[field] !== null && row[field] !== undefined && row[field] !== '');
}

function getFeedbackCount(row: Record<string, unknown>) {
	const metricField = getCandidateField(row, FEEDBACK_COUNT_FIELD_CANDIDATES);
	if (!metricField || typeof row[metricField] !== 'number') return 1;
	return Number(row[metricField]);
}

function buildTopFeedbackList(rows: Record<string, unknown>[], fieldCandidates: string[], fallbackPrefix: string): (FeedbackLineRowData & { count: number })[] {
	const groupedRows = new Map<string, { count: number, sample: Record<string, unknown> }>();

	for (const [index, row] of rows.entries()) {
		const nameField = getCandidateField(row, fieldCandidates);
		const name = nameField ? formatPreviewValue(row[nameField]) : `${fallbackPrefix} ${index + 1}`;
		const current = groupedRows.get(name);

		groupedRows.set(name, {
			count: (current?.count ?? 0) + getFeedbackCount(row),
			sample: current?.sample ?? row,
		});
	}

	return Array.from(groupedRows.entries())
		.map(([name, data]) => ({
			count: data.count,
			description: Object.entries(data.sample)
				.filter(([field]) => !fieldCandidates.includes(field) && !FEEDBACK_COUNT_FIELD_CANDIDATES.includes(field))
				.slice(0, 2)
				.map(([field, value]) => `${field}: ${formatPreviewValue(value)}`)
				.join(' · '),
			id: name,
			metric: data.count.toLocaleString('pt-PT'),
			name,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 6);
}

/* * */

export function parseFeedbackPreviewData(feedbackPreviewData: FeedbackPreviewResponse): FeedbackTopicData {
	const topLines = buildTopFeedbackList(feedbackPreviewData.rows, LINE_FIELD_CANDIDATES, 'Linha');
	const topStops = buildTopFeedbackList(feedbackPreviewData.rows, STOP_FIELD_CANDIDATES, 'Stop');

	return {
		chartBars: topLines.map(line => ({
			id: line.id,
			label: String(line.name),
			value: line.count,
		})),
		chartTitle: `Preview ${feedbackPreviewData.source.database}.${feedbackPreviewData.source.table}`,
		topLines: topLines.map(line => ({
			description: line.description,
			id: line.id,
			metric: line.metric,
			name: line.name,
		})),
		topStops: topStops.map(stop => ({
			description: stop.description,
			id: stop.id,
			metric: stop.metric,
			name: stop.name,
		})),
	};
}
