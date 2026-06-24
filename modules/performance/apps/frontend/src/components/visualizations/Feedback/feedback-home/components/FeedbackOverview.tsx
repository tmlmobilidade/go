/* * */

import type { FeedbackLineRowData, FeedbackTopicData } from '../../types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Routes } from '@/routes';
import { type HubLine, type HubStop } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from '../../styles.module.css';

import { calculateFeedbackSatisfactionIndex, formatSatisfactionIndex } from '../../feedback-metrics';
import { buildLineLabelsById, buildStopLabelsById, getLineLabel } from '../../network-labels';
import { TopFeedbackLines } from './TopFeedbackLines';

/* * */

export interface FeedbackPreviewResponse {
	columns: string[]
	rows: Record<string, unknown>[]
	source: {
		database: string
		table: string
	}
}

interface FeedbackOverviewProps {
	data?: FeedbackTopicData
	previewData?: FeedbackPreviewResponse
}

/* * */

const EMPTY_FEEDBACK_TOPIC_DATA: FeedbackTopicData = {
	chartBars: [],
	topLines: [],
	topStops: [],
};

const LINE_FIELD_CANDIDATES = ['line_id', 'lineId', 'linha', 'route_id', 'routeId'];
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

function getEntityId(row: Record<string, unknown>, entityType: 'line' | 'stop', fieldCandidates: string[]) {
	if (row.entity_type && row.entity_type !== entityType) return null;
	if (row.entity_type === entityType && typeof row.entity_id === 'string') return row.entity_id;

	const fallbackField = getCandidateField(row, fieldCandidates);
	if (!fallbackField) return null;

	return formatPreviewValue(row[fallbackField]);
}

function buildTopFeedbackList(rows: Record<string, unknown>[], entityType: 'line' | 'stop', fieldCandidates: string[], labelsById: Map<string, string>): (FeedbackLineRowData & { count: number })[] {
	const groupedRows = new Map<string, { count: number, happyCount: number, label: string, unhappyCount: number }>();

	for (const row of rows) {
		const entityId = getEntityId(row, entityType, fieldCandidates);
		if (!entityId) continue;

		const current = groupedRows.get(entityId);
		const label = entityType === 'line' ? getLineLabel(entityId, labelsById) : labelsById.get(entityId) ?? entityId;
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

function parseFeedbackPreviewData(feedbackPreviewData: FeedbackPreviewResponse, linesById: Map<string, string>, stopsById: Map<string, string>): FeedbackTopicData {
	const topLines = buildTopFeedbackList(feedbackPreviewData.rows, 'line', LINE_FIELD_CANDIDATES, linesById);
	const topStops = buildTopFeedbackList(feedbackPreviewData.rows, 'stop', STOP_FIELD_CANDIDATES, stopsById);

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
			satisfactionIndex: line.satisfactionIndex,
			satisfactionMetric: line.satisfactionMetric,
		})),
		topStops: topStops.map(stop => ({
			description: stop.description,
			id: stop.id,
			metric: stop.metric,
			name: stop.name,
			satisfactionIndex: stop.satisfactionIndex,
			satisfactionMetric: stop.satisfactionMetric,
		})),
	};
}

function FeedbackGraphCard() {
	return (
		<ContainerWrapper height={360}>
			<p className={styles.cardTitle}>Gráfico Feedback</p>
		</ContainerWrapper>
	);
}

/* * */

export function FeedbackOverview({ data, previewData }: FeedbackOverviewProps) {
	const { data: linesData } = useSWR<HubLine[], Error>({ credentials: 'omit', url: Routes.HUB_LINES });
	const { data: stopsData } = useSWR<HubStop[], Error>({ credentials: 'omit', url: Routes.HUB_STOPS });

	const linesById = useMemo(() => buildLineLabelsById(linesData), [linesData]);
	const stopsById = useMemo(() => buildStopLabelsById(stopsData), [stopsData]);

	const feedbackData = useMemo(() => {
		if (data) return data;
		if (previewData) return parseFeedbackPreviewData(previewData, linesById, stopsById);
		return EMPTY_FEEDBACK_TOPIC_DATA;
	}, [data, previewData, linesById, stopsById]);

	return (
		<>
			<FeedbackGraphCard />
			<section className={styles.listsGrid}>
				<TopFeedbackLines lines={feedbackData.topLines} nameColumnLabel="Linha" title="Linhas com mais feedbacks" />
				<TopFeedbackLines lines={feedbackData.topStops} nameColumnLabel="Paragem" title="Paragens com mais feedbacks" />
			</section>
		</>
	);
}
