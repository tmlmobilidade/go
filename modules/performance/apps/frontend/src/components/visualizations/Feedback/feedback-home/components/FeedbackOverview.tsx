/* * */

import type { FeedbackLineRowData, FeedbackTopicData } from '../../types';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Routes } from '@/routes';
import { standardSwrFetcher } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from '../../styles.module.css';

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

interface CmetLine {
	id: string
	long_name?: string
	short_name?: string
}

interface CmetStop {
	id: string
	long_name?: string
	name?: string
	short_name?: string
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

function normalizeLineId(lineId: string) {
	return lineId.replace(/^\[\d+\]/, '');
}

function getEntityId(row: Record<string, unknown>, entityType: 'line' | 'stop', fieldCandidates: string[]) {
	if (row.entity_type && row.entity_type !== entityType) return null;
	if (row.entity_type === entityType && typeof row.entity_id === 'string') return row.entity_id;

	const fallbackField = getCandidateField(row, fieldCandidates);
	if (!fallbackField) return null;

	return formatPreviewValue(row[fallbackField]);
}

function buildTopFeedbackList(rows: Record<string, unknown>[], entityType: 'line' | 'stop', fieldCandidates: string[], labelsById: Map<string, string>): (FeedbackLineRowData & { count: number })[] {
	const groupedRows = new Map<string, { count: number, label: string }>();

	for (const row of rows) {
		const entityId = getEntityId(row, entityType, fieldCandidates);
		if (!entityId) continue;

		const labelKey = entityType === 'line' ? normalizeLineId(entityId) : entityId;
		const current = groupedRows.get(entityId);

		groupedRows.set(entityId, {
			count: (current?.count ?? 0) + getFeedbackCount(row),
			label: labelsById.get(labelKey) ?? entityId,
		});
	}

	return Array.from(groupedRows.entries())
		.map(([id, groupData]) => ({
			count: groupData.count,
			description: groupData.label === id ? undefined : id,
			id,
			metric: groupData.count.toLocaleString('pt-PT'),
			name: groupData.label,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 6);
}

function buildLineLabel(line: CmetLine) {
	if (line.short_name && line.long_name) return `${line.short_name} - ${line.long_name}`;
	return line.long_name ?? line.short_name ?? line.id;
}

function buildStopLabel(stop: CmetStop) {
	return stop.name ?? stop.long_name ?? stop.short_name ?? stop.id;
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
		})),
		topStops: topStops.map(stop => ({
			description: stop.description,
			id: stop.id,
			metric: stop.metric,
			name: stop.name,
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
	const { data: linesData } = useSWR<CmetLine[], Error>(`${Routes.CMET_API}/lines`, standardSwrFetcher);
	const { data: stopsData } = useSWR<CmetStop[], Error>(`${Routes.CMET_API}/stops`, standardSwrFetcher);

	const linesById = useMemo(() => new Map(linesData?.map(line => [line.id, buildLineLabel(line)]) ?? []), [linesData]);
	const stopsById = useMemo(() => new Map(stopsData?.map(stop => [stop.id, buildStopLabel(stop)]) ?? []), [stopsData]);

	const feedbackData = useMemo(() => {
		if (data) return data;
		if (previewData) return parseFeedbackPreviewData(previewData, linesById, stopsById);
		return EMPTY_FEEDBACK_TOPIC_DATA;
	}, [data, previewData, linesById, stopsById]);

	return (
		<>
			<FeedbackGraphCard />
			<section className={styles.listsGrid}>
				<TopFeedbackLines lines={feedbackData.topLines} title="Linhas com mais feedbacks" />
				<TopFeedbackLines lines={feedbackData.topStops} title="Stops com mais feedbacks" />
			</section>
		</>
	);
}
