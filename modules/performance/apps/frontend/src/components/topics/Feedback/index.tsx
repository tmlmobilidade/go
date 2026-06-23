/* * */

'use client';

import type { FeedbackTopicData } from '@/components/visualizations/Feedback';

import {
	FEEDBACK_TOPIC_PLACEHOLDER_DATA,
	FeedbackChartCard,
	TopFeedbackLines,
} from '@/components/visualizations/Feedback';
import { Routes } from '@/routes';
import { useMemo } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

interface FeedbackTopicProps {
	data?: FeedbackTopicData
	isLoading?: boolean
}

interface FeedbackPreviewResponse {
	columns: string[]
	rows: Record<string, unknown>[]
	source: {
		database: string
		table: string
	}
}

/* * */

const NAME_FIELD_CANDIDATES = ['line_id', 'lineId', 'linha', 'route_id', 'routeId', 'id', '_id'];
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

function buildTopFeedbackList(rows: Record<string, unknown>[], fieldCandidates: string[], fallbackPrefix: string) {
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

export default function FeedbackTopic({ data, isLoading }: FeedbackTopicProps) {
	const { data: feedbackPreviewData, error: feedbackPreviewError, isLoading: isLoadingFeedbackPreview } = useSWR<FeedbackPreviewResponse>(
		data ? null : Routes.FEEDBACK_PREVIEW,
	);

	const fetchedFeedbackData = useMemo<FeedbackTopicData | null>(() => {
		if (!feedbackPreviewData) return null;

		const rows = feedbackPreviewData.rows;
		const topLines = buildTopFeedbackList(rows, NAME_FIELD_CANDIDATES, 'Linha');
		const topStops = buildTopFeedbackList(rows, STOP_FIELD_CANDIDATES, 'Stop');

		return {
			chartBars: topLines.map(line => ({
				id: line.id,
				label: String(line.name),
				value: line.count,
			})),
			chartTitle: `Preview ${feedbackPreviewData.source.database}.${feedbackPreviewData.source.table}`,
			topLines: topLines.map(row => ({
				description: row.description,
				id: row.id,
				metric: row.metric,
				name: row.name,
			})),
			topStops: topStops.map(row => ({
				description: row.description,
				id: row.id,
				metric: row.metric,
				name: row.name,
			})),
		};
	}, [feedbackPreviewData]);

	const feedbackData = data ?? fetchedFeedbackData ?? FEEDBACK_TOPIC_PLACEHOLDER_DATA;
	const isPending = isLoading ?? (!data && !feedbackPreviewError && isLoadingFeedbackPreview);

	return (
		<div className={styles.container}>
			<FeedbackChartCard bars={feedbackData.chartBars} isLoading={isPending} title={feedbackData.chartTitle} />
			<section className={styles.listsGrid}>
				<TopFeedbackLines isLoading={isPending} lines={feedbackData.topLines} title="Linhas com mais feedbacks" />
				<TopFeedbackLines isLoading={isPending} lines={feedbackData.topStops} title="Stops com mais feedbacks" />
			</section>

			<section className={styles.dashboardsSection}>
				<h2 className={styles.dashboardsTitle}>Dashboards</h2>

				<div className={styles.dashboardButtons}>
					<button className={styles.dashboardButton} type="button">
						Ver todas as linhas
					</button>
					<button className={styles.dashboardButton} type="button">
						Ver todas as paragens
					</button>
				</div>
			</section>
		</div>
	);
}

//
